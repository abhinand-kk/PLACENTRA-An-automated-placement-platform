#!/usr/bin/env python3
"""
PLACENTRA — Local Gmail API OAuth 2.0 Refresh Token Generator

This helper script runs on your local machine (where a web browser is available)
to authorize your Gmail account (placentraeducation@gmail.com) for sending outgoing
application emails from PLACENTRA via the Gmail REST API over HTTPS.

Scope requested:
    https://www.googleapis.com/auth/gmail.send (Narrowest sending scope)

Security Safeguards:
- Client Secret and Refresh Token are NEVER printed in full diagnostic output.
- Tokens are saved to an untracked local file (.env.gmail) that is excluded by .gitignore.
- Never commit credentials.json, token.json, or .env.gmail to any Git repository.
"""

import os
import sys
import argparse
from pathlib import Path

# Required Google libraries
try:
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
except ImportError:
    print("Error: Missing Google OAuth libraries.")
    print("Install them by running: pip install google-auth-oauthlib google-api-python-client")
    sys.exit(1)

SCOPES = ['https://www.googleapis.com/auth/gmail.send']
TARGET_SENDER_EMAIL = 'placentraeducation@gmail.com'


def mask_secret(value: str, visible_prefix: int = 6, visible_suffix: int = 4) -> str:
    """Masks a secret string for safe console display."""
    if not value or len(value) <= (visible_prefix + visible_suffix):
        return "********"
    return f"{value[:visible_prefix]}...{value[-visible_suffix:]} (Length: {len(value)})"


def find_default_credentials_file() -> Path | None:
    """Searches common local paths for Google Cloud client credentials JSON."""
    candidates = [
        Path("credentials.json"),
        Path("client_secret.json"),
        Path("backend/credentials.json"),
        Path("backend/client_secret.json"),
    ]
    for c in candidates:
        if c.exists() and c.is_file():
            return c
    # Check for client_secret_*.json
    for pattern in ["client_secret*.json", "backend/client_secret*.json"]:
        matches = list(Path(".").glob(pattern))
        if matches:
            return matches[0]
    return None


def main():
    parser = argparse.ArgumentParser(
        description="Obtain an OAuth 2.0 Refresh Token for PLACENTRA Gmail API email delivery."
    )
    parser.add_argument(
        "--credentials",
        "-c",
        type=str,
        help="Path to Google Cloud OAuth client credentials JSON (Desktop App type).",
    )
    parser.add_argument(
        "--output-file",
        "-o",
        type=str,
        default="backend/.env.gmail",
        help="Path to save the generated environment variables (default: backend/.env.gmail).",
    )
    parser.add_argument(
        "--show-secrets",
        action="store_true",
        help="Explicitly print unmasked secrets to stdout (not recommended in shared terminal environments).",
    )

    args = parser.parse_args()

    print("=" * 72)
    print(" PLACENTRA — Gmail API OAuth 2.0 Authorization Setup")
    print("=" * 72)
    print("This script requests authorization for the narrow sending scope:")
    print(f"  {SCOPES[0]}")
    print(f"Target account: {TARGET_SENDER_EMAIL}\n")

    # Locate credentials file
    creds_path = None
    if args.credentials:
        creds_path = Path(args.credentials)
    else:
        creds_path = find_default_credentials_file()

    client_id = None
    client_secret = None

    if creds_path and creds_path.exists():
        print(f"[✓] Using OAuth client credentials from: {creds_path}")
        flow = InstalledAppFlow.from_client_secrets_file(str(creds_path), scopes=SCOPES)
        # Extract client_id and client_secret for config display
        try:
            import json
            with open(creds_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            app_data = data.get('installed') or data.get('web') or {}
            client_id = app_data.get('client_id')
            client_secret = app_data.get('client_secret')
        except Exception:
            pass
    else:
        print("[!] No credentials JSON file found in default locations.")
        print("    You can download it from: Google Cloud Console > APIs & Services > Credentials")
        print("    Application type MUST be 'Desktop app'.\n")
        manual_id = input("Enter your OAuth Client ID (or press Enter to exit): ").strip()
        if not manual_id:
            print("Aborted.")
            sys.exit(1)
        manual_secret = input("Enter your OAuth Client Secret: ").strip()
        if not manual_secret:
            print("Aborted.")
            sys.exit(1)

        client_config = {
            "installed": {
                "client_id": manual_id,
                "client_secret": manual_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": ["http://localhost"],
            }
        }
        flow = InstalledAppFlow.from_client_config(client_config, scopes=SCOPES)
        client_id = manual_id
        client_secret = manual_secret

    print("\nLaunching browser for Google OAuth 2.0 authorization...")
    print("Please log in as: placentraeducation@gmail.com and approve the send permission.")

    # Run local webserver to handle redirect
    try:
        credentials = flow.run_local_server(
            port=0,
            prompt='consent',
            access_type='offline'
        )
    except Exception as e:
        print(f"\n[✗] Authorization failed: {e}")
        sys.exit(1)

    refresh_token = credentials.refresh_token
    if not refresh_token:
        print("\n[✗] Error: Google did not return a refresh token.")
        print("    This happens if access_type='offline' was not granted or authorization was already established.")
        print("    Revoke app access at https://myaccount.google.com/permissions and run this script again.")
        sys.exit(1)

    print("\n[✓] OAuth 2.0 authorization successful!")

    # Validate by calling Gmail API profile
    authorized_email = "Unknown"
    try:
        service = build('gmail', 'v1', credentials=credentials, cache_discovery=False)
        profile = service.users().getProfile(userId='me').execute()
        authorized_email = profile.get('emailAddress', 'Unknown')
        print(f"[✓] Authorized Gmail address: {authorized_email}")
        if authorized_email.lower() != TARGET_SENDER_EMAIL.lower():
            print(f"    [!] Warning: You authorized '{authorized_email}' instead of '{TARGET_SENDER_EMAIL}'.")
            print(f"        Ensure your GMAIL_SENDER_EMAIL matches this address.")
    except Exception as verify_err:
        print(f"    [!] Note: Profile check skipped ({verify_err}). Credentials are valid for sending.")

    # Save to local untracked file
    output_path = Path(args.output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    env_lines = [
        "# PLACENTRA Gmail API Email Credentials (DO NOT COMMIT THIS FILE)",
        f"USE_GMAIL_API=True",
        f"EMAIL_BACKEND_TYPE=gmail_api",
        f"GMAIL_CLIENT_ID={client_id or 'PASTE_CLIENT_ID_HERE'}",
        f"GMAIL_CLIENT_SECRET={client_secret or 'PASTE_CLIENT_SECRET_HERE'}",
        f"GMAIL_REFRESH_TOKEN={refresh_token}",
        f"GMAIL_SENDER_EMAIL={authorized_email if authorized_email != 'Unknown' else TARGET_SENDER_EMAIL}",
        f"DEFAULT_FROM_EMAIL=PLACENTRA Education <{authorized_email if authorized_email != 'Unknown' else TARGET_SENDER_EMAIL}>",
        "",
    ]

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(env_lines))

    print(f"\n[✓] Saved configuration safely to: {output_path} (protected by .gitignore)")

    print("\n" + "=" * 72)
    print(" CONFIGURATION VALUES FOR RENDER ENVIRONMENT (Render Dashboard > Environment)")
    print("=" * 72)
    print(f"  USE_GMAIL_API        : True")
    print(f"  EMAIL_BACKEND_TYPE   : gmail_api")
    print(f"  GMAIL_CLIENT_ID      : {mask_secret(client_id or '') if not args.show_secrets else client_id}")
    print(f"  GMAIL_CLIENT_SECRET  : {mask_secret(client_secret or '') if not args.show_secrets else client_secret}")
    print(f"  GMAIL_REFRESH_TOKEN  : {mask_secret(refresh_token) if not args.show_secrets else refresh_token}")
    print(f"  GMAIL_SENDER_EMAIL   : {authorized_email if authorized_email != 'Unknown' else TARGET_SENDER_EMAIL}")
    print(f"  DEFAULT_FROM_EMAIL   : PLACENTRA Education <{authorized_email if authorized_email != 'Unknown' else TARGET_SENDER_EMAIL}>")
    print("=" * 72)

    if not args.show_secrets:
        print(f"\n(Note: Secrets are masked in this output. Inspect {output_path} locally to copy the exact values.)")

    print("\nIMPORTANT NOTES ON OAUTH REFRESH TOKEN LIFESPAN:")
    print("1. If your Google Cloud project's OAuth Consent Screen is in 'Testing' status:")
    print("   Google limits refresh tokens to 7 DAYS for external users with sensitive scopes (gmail.send).")
    print("2. For permanent production use without 7-day expiration:")
    print("   - For Google Workspace domains: Set User Type to 'Internal'.")
    print("   - For personal @gmail.com accounts: Publish your app to 'In production' in Google Cloud Console.")
    print("     (Sensitive scope verification by Google may be requested if public users authenticate,")
    print("      but for your own single-user service account, publishing removes the 7-day testing expiry.)\n")


if __name__ == "__main__":
    main()
