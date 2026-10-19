import logging
import re
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

from notifications.models import Notification

logger = logging.getLogger(__name__)


def send_shortlisting_notification(application):
    """
    Sends candidate shortlisting appreciation/notification email (without interview details and without PDF attachment)
    and creates an in-app notification for the student.
    Handles exceptions gracefully to prevent breaking recruiter workflow.
    """
    try:
        student = application.student
        job = application.job
        recruiter = getattr(job, 'recruiter', None)
        user = getattr(student, 'user', None)
        contact = getattr(student, 'contact', None)

        recipients = []
        if user and user.email and user.email.strip():
            recipients.append(user.email.strip())
        if contact and contact.primary_email and contact.primary_email.strip() and contact.primary_email.strip() not in recipients:
            recipients.append(contact.primary_email.strip())
        if contact and contact.personal_email and contact.personal_email.strip() and contact.personal_email.strip() not in recipients:
            recipients.append(contact.personal_email.strip())

        if not recipients:
            logger.warning(f"Shortlisting notification skipped: No candidate email found for application ID {application.id}")
            return False

        student_name = f"{student.first_name} {student.last_name}".strip()
        company_name = recruiter.company_name if recruiter else "Recruiting Organization"
        job_title = job.job_title

        subject = f"Congratulations! You have been Shortlisted for {job_title} at {company_name}"

        # HTML Email Body (NO interview details, NO attached PDF)
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }}
                .header {{ background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 24px 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 22px; letter-spacing: 0.5px; }}
                .header p {{ margin: 5px 0 0 0; opacity: 0.9; font-size: 13px; }}
                .content {{ padding: 30px; }}
                .status-badge {{ display: inline-block; background: #dcfce7; color: #15803d; font-weight: bold; padding: 6px 14px; border-radius: 20px; font-size: 13px; margin: 10px 0; border: 1px solid #bbf7d0; }}
                .notice-box {{ background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }}
                .footer {{ background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 30px; font-size: 12px; color: #6b7280; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>PLACENTRA</h1>
                    <p>Campus Placement & Recruitment Platform</p>
                </div>
                <div class="content">
                    <p>Dear <b>{student_name}</b>,</p>
                    <p>Congratulations! We are pleased to inform you that your application for <b>{job_title}</b> at <b>{company_name}</b> has been evaluated and successfully <b>shortlisted</b> for the next stage of the campus recruitment process.</p>
                    
                    <div style="text-align: center;">
                        <span class="status-badge">✓ APPLICATION SHORTLISTED</span>
                    </div>

                    <div class="notice-box">
                        <p style="margin: 0; font-size: 14px; color: #1e3a8a;">
                            <b>Next Steps & Interview Details:</b><br/>
                            Further details regarding your interview (including date, time, mode, and venue or meeting link) will be shared with you separately once your interview is scheduled.
                        </p>
                    </div>

                    <p>We appreciate your interest and the effort you have put into your application. Please continue to monitor your registered email address and PLACENTRA portal for further updates.</p>

                    <p style="margin-top:20px;">Best regards,<br><b>PLACENTRA Placement Cell</b></p>
                </div>
                <div class="footer">
                    <p>This is an automated notification from PLACENTRA. Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain Text Fallback
        text_content = (
            f"Dear {student_name},\n\n"
            f"Congratulations! We are pleased to inform you that your application for {job_title} at {company_name} has been shortlisted for the next stage of the campus recruitment process.\n\n"
            f"We appreciate your interest and the effort you have put into your application.\n\n"
            f"Further details regarding the interview, including the date, time, mode, and venue or meeting link, will be shared with you separately once the interview is scheduled.\n\n"
            f"Please continue to monitor your registered email address and PLACENTRA account for further updates.\n\n"
            f"Best regards,\nPLACENTRA Placement Cell"
        )

        # Send Email WITHOUT PDF Attachment
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'placentraeducation@gmail.com')
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=recipients
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)

        logger.info(f"Shortlisting notification email sent to {recipients} for application ID {application.id}")

        # Create In-App Notification
        if user:
            Notification.objects.create(
                user=user,
                title="Application Shortlisted",
                message=f"Your application for {job_title} at {company_name} has been shortlisted for the next stage. Interview details will be shared separately once scheduled.",
                notification_type="Application"
            )

        return True

    except Exception as e:
        logger.exception(f"Error sending shortlisting notification for application ID {getattr(application, 'id', 'Unknown')}: {e}")
        return False


def send_interview_notification_email(interview):
    """
    Sends candidate interview invitation email with attached Interview Invitation PDF
    and creates an in-app notification for the student.
    Handles exceptions gracefully without breaking interview scheduling workflow.
    """
    try:
        application = interview.application
        student = application.student
        job = application.job
        recruiter = getattr(job, 'recruiter', None)
        user = getattr(student, 'user', None)
        contact = getattr(student, 'contact', None)

        recipients = []
        if user and user.email and user.email.strip():
            recipients.append(user.email.strip())
        if contact and contact.primary_email and contact.primary_email.strip() and contact.primary_email.strip() not in recipients:
            recipients.append(contact.primary_email.strip())
        if contact and contact.personal_email and contact.personal_email.strip() and contact.personal_email.strip() not in recipients:
            recipients.append(contact.personal_email.strip())

        if not recipients:
            logger.warning(f"Interview notification skipped: No candidate email found for interview ID {interview.id}")
            return False

        student_name = f"{student.first_name} {student.last_name}".strip()
        company_name = recruiter.company_name if recruiter else "Recruiting Organization"
        job_title = job.job_title
        interview_type = interview.interview_type
        date_str = interview.interview_date.strftime('%d %B %Y') if interview.interview_date else "N/A"
        time_str = interview.interview_time.strftime('%I:%M %p') if interview.interview_time else "N/A"
        mode = interview.mode or "Online"
        location_or_link = interview.location_or_link or "Details will be shared shortly"
        instructions = interview.instructions or "None"

        subject = f"Interview Scheduled – {interview_type} for {job_title} at {company_name} | PLACENTRA"

        # HTML Body
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }}
                .header {{ background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 24px 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 22px; letter-spacing: 0.5px; }}
                .header p {{ margin: 5px 0 0 0; opacity: 0.9; font-size: 13px; }}
                .content {{ padding: 30px; }}
                .status-badge {{ display: inline-block; background: #dbeafe; color: #1e40af; font-weight: bold; padding: 6px 14px; border-radius: 20px; font-size: 13px; margin: 10px 0; border: 1px solid #bfdbfe; }}
                .details-box {{ background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }}
                .details-box ul {{ margin: 8px 0 0 0; padding-left: 20px; list-style-type: none; }}
                .details-box li {{ margin-bottom: 6px; font-size: 14px; }}
                .disclaimer-box {{ background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; padding: 12px 16px; border-radius: 6px; font-size: 12px; margin-top: 24px; }}
                .footer {{ background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 30px; font-size: 12px; color: #6b7280; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>PLACENTRA</h1>
                    <p>Campus Placement & Recruitment Platform</p>
                </div>
                <div class="content">
                    <p>Hello <b>{student_name}</b>,</p>
                    <p>You are invited to attend your <b>{interview_type}</b> for the position of <b>{job_title}</b> at <b>{company_name}</b>.</p>
                    
                    <div style="text-align: center;">
                        <span class="status-badge">📅 {interview_type.upper()} SCHEDULED</span>
                    </div>

                    <div class="details-box">
                        <h4 style="margin:0 0 10px 0; color:#1e3a8a;">Interview Schedule Details</h4>
                        <ul style="padding-left:0;">
                            <li><b>Interview Type:</b> {interview_type}</li>
                            <li><b>Date:</b> {date_str}</li>
                            <li><b>Time:</b> {time_str} ({interview.duration_minutes} mins)</li>
                            <li><b>Mode:</b> {mode}</li>
                            <li><b>Venue / Meeting Link:</b> {location_or_link}</li>
                            <li><b>Instructions:</b> {instructions}</li>
                        </ul>
                    </div>

                    <p>Attached to this email is your official <b>Interview Invitation Letter</b> (PDF) containing your complete schedule and candidate guidelines.</p>

                    <div class="disclaimer-box">
                        <b>Important Note:</b> This email confirms your scheduled interview round. Please join on time with your required documents or setup.
                    </div>

                    <p style="margin-top:20px;">Regards,<br><b>PLACENTRA Education</b><br>Campus Placement Office</p>
                </div>
                <div class="footer">
                    <p>This is an automated notification from PLACENTRA. Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain Text Fallback
        text_content = (
            f"Hello {student_name},\n\n"
            f"You are invited to attend your {interview_type} for the position of {job_title} at {company_name}.\n\n"
            f"Interview Details:\n"
            f"Interview Type: {interview_type}\n"
            f"Date: {date_str}\n"
            f"Time: {time_str} ({interview.duration_minutes} mins)\n"
            f"Mode: {mode}\n"
            f"Venue / Meeting Link: {location_or_link}\n"
            f"Instructions: {instructions}\n\n"
            f"Attached is your official Interview Invitation Letter (PDF).\n\n"
            f"Please be available at the scheduled time.\n\n"
            f"Regards,\nPLACENTRA Education\nCampus Placement Office"
        )

        # Generate Interview Invitation PDF Attachment
        from .pdf_generator import generate_interview_invitation_pdf
        pdf_bytes = generate_interview_invitation_pdf(interview)
        sanitized_name = re.sub(r'[^a-zA-Z0-9_]', '_', f"{student.first_name}_{student.last_name}")
        sanitized_type = re.sub(r'[^a-zA-Z0-9_]', '_', interview_type)
        pdf_filename = f"{sanitized_name}_{sanitized_type}_Invitation_Letter.pdf"

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'placentraeducation@gmail.com')
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=recipients
        )
        email.attach_alternative(html_content, "text/html")
        email.attach(pdf_filename, pdf_bytes, "application/pdf")

        email_sent = False
        try:
            email.send(fail_silently=False)
            email_sent = True
            logger.info(f"Interview invitation email sent to {recipients} for interview ID {interview.id}")
        except Exception as mail_err:
            logger.exception(f"SMTP failure while sending interview email to {recipients}: {mail_err}")

        # Create Candidate In-App Notification
        if user:
            try:
                Notification.objects.create(
                    user=user,
                    title=f"{interview_type} Scheduled",
                    message=f"Your {interview_type} for {job_title} at {company_name} has been scheduled on {date_str} at {time_str}. Check your email for your Interview Invitation Letter.",
                    notification_type="Interview"
                )
            except Exception as notif_err:
                logger.exception(f"Error creating in-app notification: {notif_err}")

        return email_sent

    except Exception as e:
        logger.exception(f"Error processing interview notification for interview ID {getattr(interview, 'id', 'Unknown')}: {e}")
        return False


def send_selection_offer_email(application):
    """
    Sends candidate selection and provisional offer notification email with attached
    Candidate Selection & Provisional Offer Letter PDF, and creates an in-app notification.
    Handles exceptions gracefully to prevent breaking recruiter workflow.
    Returns a tuple (email_sent: bool, recipient_or_error: str).
    """
    try:
        student = application.student
        job = application.job
        recruiter = getattr(job, 'recruiter', None)
        user = getattr(student, 'user', None)
        contact = getattr(student, 'contact', None)

        recipients = []
        if user and user.email and user.email.strip():
            recipients.append(user.email.strip())
        if contact and contact.primary_email and contact.primary_email.strip() and contact.primary_email.strip() not in recipients:
            recipients.append(contact.primary_email.strip())
        if contact and contact.personal_email and contact.personal_email.strip() and contact.personal_email.strip() not in recipients:
            recipients.append(contact.personal_email.strip())

        if not recipients:
            logger.warning(f"Selection offer email skipped: No candidate email found for application ID {application.id}")
            return False, "No registered candidate email found."

        student_name = f"{student.first_name} {student.last_name}".strip()
        company_name = recruiter.company_name if recruiter else "Recruiting Organization"
        job_title = job.job_title

        # Authoritative offer terms
        package_str = f"{job.package_lpa} LPA" if (job.package_lpa and job.package_lpa > 0) else None
        work_mode_str = getattr(job.work_mode, 'name', None) if getattr(job, 'work_mode', None) else None
        location_str = job.location if job.location else None
        emp_type_str = getattr(job.employment_type, 'name', None) if getattr(job, 'employment_type', None) else None
        expected_timeline = job.expected_hiring_month if job.expected_hiring_month else None

        subject = f"Congratulations! Selection & Offer Letter – {job_title} at {company_name} | PLACENTRA"

        # Construct Offer Details Rows
        rows_html = f"""
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 160px;">Position Offered:</td><td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{job_title}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Organization:</td><td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{company_name}</td></tr>
        """
        if package_str:
            rows_html += f"""<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Annual CTC / Package:</td><td style="padding: 6px 0; color: #059669; font-weight: 700;">{package_str}</td></tr>"""
        if work_mode_str:
            rows_html += f"""<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Work Mode:</td><td style="padding: 6px 0; color: #0f172a;">{work_mode_str}</td></tr>"""
        if location_str:
            rows_html += f"""<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Location:</td><td style="padding: 6px 0; color: #0f172a;">{location_str}</td></tr>"""
        if emp_type_str:
            rows_html += f"""<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Employment Type:</td><td style="padding: 6px 0; color: #0f172a;">{emp_type_str}</td></tr>"""
        if expected_timeline:
            rows_html += f"""<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Expected Joining:</td><td style="padding: 6px 0; color: #0f172a;">{expected_timeline}</td></tr>"""
        rows_html += """<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Status:</td><td style="padding: 6px 0; color: #16a34a; font-weight: 700;">Selected &amp; Offered</td></tr>"""

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }}
                .header {{ background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 24px 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 22px; letter-spacing: 0.5px; }}
                .header p {{ margin: 5px 0 0 0; opacity: 0.9; font-size: 13px; }}
                .content {{ padding: 30px; }}
                .status-badge {{ display: inline-block; background: #dcfce7; color: #15803d; font-weight: bold; padding: 6px 14px; border-radius: 20px; font-size: 13px; margin: 10px 0; border: 1px solid #bbf7d0; }}
                .offer-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 20px 0; }}
                .notice-box {{ background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }}
                .footer {{ background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 30px; font-size: 12px; color: #6b7280; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>PLACENTRA</h1>
                    <p>Campus Placement &amp; Recruitment Platform</p>
                </div>
                <div class="content">
                    <p>Dear <b>{student_name}</b>,</p>
                    <p>Congratulations! We are delighted to inform you that you have been officially <b>SELECTED</b> for the position of <b>{job_title}</b> at <b>{company_name}</b> following the campus recruitment evaluation process.</p>
                    
                    <div style="text-align: center;">
                        <span class="status-badge">&#127881; CANDIDATE SELECTED &amp; OFFERED</span>
                    </div>

                    <div class="offer-card">
                        <div style="font-weight: 700; font-size: 14px; color: #1e3a8a; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                            Placement Offer Summary
                        </div>
                        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                            {rows_html}
                        </table>
                    </div>

                    <div class="notice-box">
                        <p style="margin: 0; font-size: 13.5px; color: #1e3a8a;">
                            <b>Attached Document:</b><br/>
                            Attached to this email is your official <b>Candidate Selection &amp; Provisional Offer Letter (PDF)</b>. Please download, review the details carefully, and retain a copy for your official placement records.
                        </p>
                    </div>

                    <p style="font-size: 13.5px; color: #374151;">
                        <b>Next Steps:</b> Detailed corporate onboarding instructions, pre-employment documentation, and reporting guidelines will be coordinated by <b>{company_name}</b> HR and the Campus Placement Office.
                    </p>

                    <p style="margin-top:20px;">Warm regards,<br><b>PLACENTRA Placement Cell</b><br><span style="font-size: 12px; color: #64748b;">Campus Placement &amp; Recruitment Platform</span></p>
                </div>
                <div class="footer">
                    <p>This is an automated notification from PLACENTRA. Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain Text Fallback
        text_lines = [
            f"Dear {student_name},",
            "",
            f"Congratulations! We are delighted to inform you that you have been officially SELECTED for the position of {job_title} at {company_name} through PLACENTRA Campus Placement.",
            "",
            "Offer Details:",
            f"- Position: {job_title}",
            f"- Organization: {company_name}",
        ]
        if package_str:
            text_lines.append(f"- Annual CTC / Package: {package_str}")
        if work_mode_str:
            text_lines.append(f"- Work Mode: {work_mode_str}")
        if location_str:
            text_lines.append(f"- Location: {location_str}")
        if emp_type_str:
            text_lines.append(f"- Employment Type: {emp_type_str}")
        if expected_timeline:
            text_lines.append(f"- Expected Joining: {expected_timeline}")
        text_lines.extend([
            "- Status: Selected & Offered",
            "",
            "Attached to this email is your official Candidate Selection & Provisional Offer Letter (PDF).",
            "",
            f"Next Steps: Detailed onboarding instructions and reporting guidelines will be communicated by {company_name} HR and the Campus Placement Office.",
            "",
            "Warm regards,",
            "PLACENTRA Placement Cell",
            "Campus Placement & Recruitment Platform"
        ])
        text_content = "\n".join(text_lines)

        # Generate Selection Offer PDF Attachment
        from .pdf_generator import generate_selection_offer_pdf
        pdf_bytes = generate_selection_offer_pdf(application)
        sanitized_name = re.sub(r'[^a-zA-Z0-9_]', '_', f"{student.first_name}_{student.last_name}")
        pdf_filename = f"{sanitized_name}_Selection_Offer_Letter.pdf"

        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'placentraeducation@gmail.com')
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=recipients
        )
        email.attach_alternative(html_content, "text/html")
        email.attach(pdf_filename, pdf_bytes, "application/pdf")

        email_sent = False
        try:
            email.send(fail_silently=False)
            email_sent = True
            logger.info(f"Selection offer email sent successfully to {recipients} for application ID {application.id}")
        except Exception as mail_err:
            logger.exception(f"SMTP failure while sending selection offer email to {recipients}: {mail_err}")

        # Create In-App Notification for Student
        if user:
            try:
                Notification.objects.create(
                    user=user,
                    title=f"Selected & Offered — {job_title}",
                    message=f"Congratulations! You have been selected for {job_title} at {company_name}. Your Selection & Provisional Offer Letter has been delivered to your email ({recipients[0]}). [Application #{application.id}]",
                    notification_type="Application"
                )
            except Exception as notif_err:
                logger.exception(f"Error creating in-app notification: {notif_err}")

        return email_sent, (recipients[0] if email_sent else "Email delivery failed.")

    except Exception as e:
        logger.exception(f"Error processing selection offer notification for application ID {getattr(application, 'id', 'Unknown')}: {e}")
        return False, str(e)


def send_placement_officer_registration_email(user):
    """
    Sends a professional account-creation confirmation email to the newly registered
    Placement Officer at user.email (Placement Officer Email).
    Handles exceptions gracefully so registration is never rolled back on email failure.
    """
    try:
        if not user or not user.email or not user.email.strip():
            logger.warning("Placement Officer registration email skipped: Invalid user or empty email.")
            return False

        officer_email = user.email.strip()

        # Retrieve PlacementOfficerProfile and Institution details
        profile = getattr(user, 'placement_officer_profile', None)
        officer_name = profile.full_name if (profile and profile.full_name) else "Placement Officer"
        institution_name = profile.institution.institution_name if (profile and profile.institution) else "Campus Institution"

        subject = "Welcome to PLACENTRA — Placement Officer Account Created Successfully"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'placentraeducation@gmail.com')

        # HTML Email Body
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f8fafc; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.1); border: 1px solid #e2e8f0; }}
                .header {{ background: linear-gradient(135deg, #0f172a, #1e1b4b); color: #ffffff; padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff; }}
                .header p {{ margin: 6px 0 0 0; color: #cbd5e1; font-size: 13px; font-weight: 500; }}
                .content {{ padding: 32px 30px; }}
                .badge-success {{ display: inline-block; background: #ecfdf5; color: #047857; font-weight: 700; padding: 6px 16px; border-radius: 20px; font-size: 13px; margin-bottom: 20px; border: 1px solid #a7f3d0; }}
                .info-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }}
                .info-row {{ display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }}
                .info-label {{ color: #64748b; font-weight: 600; min-width: 140px; }}
                .info-val {{ color: #0f172a; font-weight: 700; word-break: break-all; }}
                .next-steps {{ background: #eef2ff; border-left: 4px solid #4f46e5; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0; }}
                .next-steps h4 {{ margin: 0 0 8px 0; color: #3730a3; font-size: 15px; font-weight: 700; }}
                .next-steps ol {{ margin: 0; padding-left: 20px; color: #312e81; font-size: 13.5px; }}
                .security-note {{ background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; font-size: 12.5px; color: #b45309; margin-top: 20px; }}
                .footer {{ background: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 20px 30px; font-size: 12px; color: #64748b; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>PLACENTRA</h1>
                    <p>Campus Placement & Recruitment Platform</p>
                </div>

                <div class="content">
                    <div style="text-align: center;">
                        <span class="badge-success">✓ Placement Officer Account Created</span>
                    </div>

                    <p style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 10px;">Dear {officer_name},</p>
                    
                    <p>Congratulations! Your Placement Officer profile has been successfully registered on <b>PLACENTRA</b>, the Campus Placement & Recruitment Platform.</p>

                    <div class="info-card">
                        <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                            Account Registration Summary
                        </div>
                        <div class="info-row">
                            <span class="info-label">Placement Officer Name:</span>
                            <span class="info-val">{officer_name}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Registered Login Email:</span>
                            <span class="info-val">{officer_email}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Role:</span>
                            <span class="info-val">Placement Officer</span>
                        </div>
                        <div class="info-row" style="margin-bottom:0;">
                            <span class="info-label">Institution:</span>
                            <span class="info-val">{institution_name}</span>
                        </div>
                    </div>

                    <p>You can use your registered email address (<b>{officer_email}</b>) and the password created during registration to sign in to your PLACENTRA Placement Officer account.</p>

                    <p>Through the PLACENTRA Placement Officer Portal, you will be able to manage placement activities, coordinate recruitment processes, monitor candidate information, and access placement features available to your role.</p>

                    <div class="next-steps">
                        <h4>Next Steps:</h4>
                        <ol style="margin:0; padding-left: 20px;">
                            <li style="margin-bottom: 6px;">Visit the PLACENTRA login page.</li>
                            <li style="margin-bottom: 6px;">Sign in using your Placement Officer Email: <b>{officer_email}</b></li>
                            <li>Access your Placement Officer Dashboard to coordinate campus recruitment drives.</li>
                        </ol>
                    </div>

                    <div class="security-note">
                        🔒 <b>Security Reminder:</b> Please keep your login credentials confidential. PLACENTRA will never ask you to share your password by email.
                    </div>

                    <p style="margin-top: 24px;">Thank you for joining PLACENTRA. We look forward to supporting your institution's campus placement activities.</p>

                    <p style="margin-top: 20px; font-size: 14px; color: #0f172a;">
                        Best regards,<br/>
                        <b>PLACENTRA Team</b><br/>
                        <span style="font-size: 12px; color: #64748b;">Campus Placement & Recruitment Platform</span>
                    </p>
                </div>

                <div class="footer">
                    <p>This is an automated notification from PLACENTRA. Please do not reply directly to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain Text Fallback
        text_content = (
            f"Dear {officer_name},\n\n"
            f"Congratulations!\n\n"
            f"Your Placement Officer profile has been successfully created on PLACENTRA, the Campus Placement & Recruitment Platform.\n\n"
            f"Account Registration Summary:\n"
            f"- Placement Officer Name: {officer_name}\n"
            f"- Registered Login Email: {officer_email}\n"
            f"- Role: Placement Officer\n"
            f"- Institution: {institution_name}\n\n"
            f"You can use your registered email address ({officer_email}) and the password created during registration to sign in to your PLACENTRA Placement Officer account.\n\n"
            f"Through the PLACENTRA Placement Officer Portal, you will be able to manage placement activities, coordinate recruitment processes, and monitor candidate information.\n\n"
            f"Next Steps:\n"
            f"1. Visit the PLACENTRA login page.\n"
            f"2. Sign in using your Placement Officer Email: {officer_email}\n"
            f"3. Access your Placement Officer Dashboard to coordinate campus recruitment drives.\n\n"
            f"Security Reminder: Please keep your login credentials confidential. PLACENTRA will never ask you to share your password by email.\n\n"
            f"Best regards,\n"
            f"PLACENTRA Team\n"
            f"Campus Placement & Recruitment Platform"
        )

        msg = EmailMultiAlternatives(subject, text_content, from_email, [officer_email])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

        logger.info(f"Placement Officer registration confirmation email sent successfully to {officer_email}")
        return True

    except Exception as e:
        logger.exception(f"Failed to send Placement Officer registration email to {getattr(user, 'email', 'unknown')}: {e}")
        return False

