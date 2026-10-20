"""
Gmail API Email Backend for Django

Delivers outgoing messages via the Google Gmail REST API users.messages.send endpoint
over HTTPS using OAuth 2.0 refresh tokens.
Preserves Django EmailMessage and EmailMultiAlternatives (HTML alternatives, attachments,
PDF offer letters, and multi-recipient routing).
"""

import base64
import logging
from django.core.mail.backends.base import BaseEmailBackend
from django.core.exceptions import ImproperlyConfigured
from django.conf import settings
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.exceptions import RefreshError

logger = logging.getLogger('django')


def _sanitize_error(error):
    """
    Sanitize exception strings to prevent leaking tokens, client secrets, or private data in logs.
    """
    err_type = type(error).__name__
    if isinstance(error, HttpError):
        status = getattr(getattr(error, 'resp', None), 'status', 'Unknown')
        reason = getattr(error, 'reason', '')
        return f"Gmail API HttpError (status {status}): {reason}"
    if isinstance(error, RefreshError):
        err_msg = str(error)
        return f"Gmail OAuth RefreshError: Token refresh failed - {err_msg[:120]}"
    return f"{err_type}: {str(error)[:200]}"


class GmailAPIEmailBackend(BaseEmailBackend):
    """
    Django email backend that sends emails using the Gmail API (users.messages.send) over HTTPS.
    Requires OAuth 2.0 Client ID, Client Secret, and Refresh Token.
    """
    SCOPES = ['https://www.googleapis.com/auth/gmail.send']

    def __init__(self, fail_silently=False, client_id=None, client_secret=None,
                 refresh_token=None, sender_email=None, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.client_id = client_id or getattr(settings, 'GMAIL_CLIENT_ID', None)
        self.client_secret = client_secret or getattr(settings, 'GMAIL_CLIENT_SECRET', None)
        self.refresh_token = refresh_token or getattr(settings, 'GMAIL_REFRESH_TOKEN', None)
        self.sender_email = sender_email or getattr(settings, 'GMAIL_SENDER_EMAIL', 'placentraeducation@gmail.com')
        self._service = None

    def _get_service(self):
        """
        Builds and caches the Google API client service using OAuth 2.0 refresh credentials.
        """
        if self._service is not None:
            return self._service

        if not (self.client_id and self.client_secret and self.refresh_token):
            missing = []
            if not self.client_id:
                missing.append('GMAIL_CLIENT_ID')
            if not self.client_secret:
                missing.append('GMAIL_CLIENT_SECRET')
            if not self.refresh_token:
                missing.append('GMAIL_REFRESH_TOKEN')
            raise ImproperlyConfigured(
                f"Gmail API email backend is enabled but missing required credentials: {', '.join(missing)}."
            )

        try:
            creds = Credentials(
                token=None,
                refresh_token=self.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.client_id,
                client_secret=self.client_secret,
                scopes=self.SCOPES,
            )
            self._service = build('gmail', 'v1', credentials=creds, cache_discovery=False)
            return self._service
        except Exception as e:
            sanitized = _sanitize_error(e)
            logger.error(f"Failed to initialize Gmail API service client: {sanitized}")
            raise

    def close(self):
        """Closes and resets the cached Gmail API service client."""
        self._service = None

    def send_messages(self, email_messages):
        """
        Sends one or more EmailMessage or EmailMultiAlternatives instances.
        Converts the MIME message to base64url and submits via Gmail API users.messages.send.
        Returns the number of successfully delivered messages.
        """
        if not email_messages:
            return 0

        try:
            service = self._get_service()
        except Exception as init_err:
            sanitized = _sanitize_error(init_err)
            logger.error(f"Gmail API email backend initialization error: {sanitized}")
            if not self.fail_silently:
                raise
            return 0

        sent_count = 0
        for message in email_messages:
            recipients_summary = list(getattr(message, 'to', []))
            try:
                # Build standard RFC 2822 MIME message including attachments & HTML alternatives
                mime_msg = message.message()

                # Ensure Bcc recipients are preserved in the MIME header so Gmail delivers to them;
                # Gmail automatically strips the Bcc header before delivery to other recipients.
                if getattr(message, 'bcc', None) and 'Bcc' not in mime_msg:
                    mime_msg['Bcc'] = ', '.join(str(addr) for addr in message.bcc)

                # Ensure From header is present and valid for Gmail API
                current_from = mime_msg.get('From', '')
                default_from = f"PLACENTRA Education <{self.sender_email}>"
                if not current_from or 'resend.dev' in current_from:
                    if 'From' in mime_msg:
                        del mime_msg['From']
                    configured_default = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
                    if configured_default and 'resend.dev' not in configured_default:
                        mime_msg['From'] = configured_default
                    else:
                        mime_msg['From'] = default_from

                raw_bytes = mime_msg.as_bytes()
                raw_b64 = base64.urlsafe_b64encode(raw_bytes).decode('ascii')

                request_body = {'raw': raw_b64}
                response = service.users().messages().send(
                    userId='me',
                    body=request_body
                ).execute()

                message_id = response.get('id') if isinstance(response, dict) else None
                if message_id:
                    sent_count += 1
                    logger.info(f"Gmail API accepted message for {recipients_summary} (Message ID: {message_id})")
                else:
                    raise RuntimeError("Gmail API response did not return an accepted message ID.")

            except Exception as err:
                sanitized = _sanitize_error(err)
                logger.error(f"Gmail API delivery failed for {recipients_summary}: {sanitized}")
                if not self.fail_silently:
                    raise

        return sent_count
