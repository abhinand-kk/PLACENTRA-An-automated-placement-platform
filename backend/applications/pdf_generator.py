import io
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from placement_drives.models import PlacementDrive


class ShortlistingLetterPDFGenerator:
    """
    Generates a formal A4 Candidate Shortlisting Letter PDF inspired by traditional institutional offer letters.
    Renders formal paragraphs, generous whitespace, recipient block, key details, formal closing, and signature block.
    Strictly consumes real Django model instances (Application, StudentProfile, Job, PlacementDrive).
    Optimized to fit perfectly on a single balanced A4 portrait page.
    """

    def __init__(self, application):
        self.application = application
        self.student = application.student
        self.job = application.job
        self.recruiter = getattr(self.job, 'recruiter', None)
        self.institution = getattr(self.student, 'institution', None)
        self.current_edu = getattr(self.student, 'current_education', None)
        self.contact = getattr(self.student, 'contact', None)

    def _get_interview_details(self):
        drive = PlacementDrive.objects.filter(job=self.job).order_by('-drive_date').first()
        if drive:
            return {
                'scheduled': True,
                'title': drive.drive_title or f"{self.job.job_title} Placement Drive",
                'date': drive.drive_date.strftime('%d %B %Y') if drive.drive_date else 'To be scheduled',
                'time': drive.drive_time.strftime('%I:%M %p') if drive.drive_time else 'To be scheduled',
                'venue': drive.venue or 'Placement Cell / Online Platform',
                'description': drive.description or ''
            }
        return {
            'scheduled': False,
            'date': 'To be scheduled',
            'time': 'To be scheduled',
            'venue': 'Placement Cell / Online Platform',
            'notice': 'Interview details will be shared through PLACENTRA once scheduled.'
        }

    def generate(self):
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=45,
            rightMargin=45,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Formal Institutional Palette
        PRIMARY_NAVY = colors.HexColor('#1E3A8A')
        TEXT_DARK = colors.HexColor('#111827')
        TEXT_MUTED = colors.HexColor('#4B5563')
        DIVIDER_COLOR = colors.HexColor('#94A3B8')

        # Custom Formal Typography
        styles.add(ParagraphStyle(
            name='InstHeader',
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=18,
            textColor=PRIMARY_NAVY,
            alignment=1
        ))

        styles.add(ParagraphStyle(
            name='InstSubHeader',
            fontName='Helvetica',
            fontSize=9,
            leading=11,
            textColor=TEXT_MUTED,
            alignment=1
        ))

        styles.add(ParagraphStyle(
            name='LetterTitle',
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=15,
            textColor=PRIMARY_NAVY,
            alignment=1,
            spaceAfter=1
        ))

        styles.add(ParagraphStyle(
            name='LetterSubTitle',
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            textColor=TEXT_MUTED,
            alignment=1
        ))

        styles.add(ParagraphStyle(
            name='MetaText',
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=TEXT_DARK
        ))

        styles.add(ParagraphStyle(
            name='FormalBody',
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=TEXT_DARK,
            alignment=4
        ))

        styles.add(ParagraphStyle(
            name='FormalBodyBold',
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=13.5,
            textColor=TEXT_DARK
        ))

        styles.add(ParagraphStyle(
            name='SectionHeading',
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=PRIMARY_NAVY,
            spaceBefore=3,
            spaceAfter=2
        ))

        styles.add(ParagraphStyle(
            name='DetailLabel',
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12.5,
            textColor=TEXT_DARK
        ))

        styles.add(ParagraphStyle(
            name='DetailValue',
            fontName='Helvetica',
            fontSize=9,
            leading=12.5,
            textColor=TEXT_DARK
        ))

        styles.add(ParagraphStyle(
            name='DisclaimerNotice',
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=TEXT_MUTED,
            alignment=4
        ))

        styles.add(ParagraphStyle(
            name='SignatureLabel',
            fontName='Helvetica',
            fontSize=8.5,
            leading=11,
            textColor=TEXT_DARK
        ))

        styles.add(ParagraphStyle(
            name='FooterText',
            fontName='Helvetica-Oblique',
            fontSize=7.5,
            leading=9.5,
            textColor=TEXT_MUTED,
            alignment=1
        ))

        story = []

        # --- 1. LETTERHEAD & INSTITUTIONAL HEADER ---
        inst_name = self.institution.institution_name if self.institution else "PLACENTRA Education Partner Campus"
        story.append(Paragraph("PLACENTRA Education", styles['InstHeader']))
        story.append(Paragraph(f"Campus Placement Office &bull; {inst_name}", styles['InstSubHeader']))
        story.append(Spacer(1, 4))
        story.append(HRFlowable(width="100%", thickness=1.0, color=DIVIDER_COLOR, spaceAfter=6))

        # --- 2. DOCUMENT TITLE BLOCK ---
        story.append(Paragraph("CANDIDATE SHORTLISTING LETTER", styles['LetterTitle']))
        story.append(Paragraph("SHORTLISTING &amp; INTERVIEW INVITATION", styles['LetterSubTitle']))
        story.append(Spacer(1, 6))

        # --- 3. DATE & REFERENCE LINE ---
        issue_date = datetime.now().strftime('%d %B %Y')
        ref_no = f"PLC-SL-{self.application.id:06d}"
        meta_table = Table([
            [
                Paragraph(f"<b>Date:</b> {issue_date}", styles['MetaText']),
                Paragraph(f"<b>Reference No.:</b> {ref_no}", styles['MetaText'])
            ]
        ], colWidths=[250, 255])
        meta_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 8))

        # --- 4. RECIPIENT BLOCK ---
        full_name = f"{self.student.first_name} {self.student.middle_name} {self.student.last_name}".replace("  ", " ").strip()
        reg_no = self.student.register_number or "N/A"
        cand_email = getattr(self.student.user, 'email', None) or (self.contact.primary_email if self.contact else "N/A")

        recipient_text = f"To,<br/><b>{full_name}</b><br/>Register / Roll No: {reg_no}<br/>Institution: {inst_name}"
        if self.current_edu:
            prog_name = self.current_edu.program.name if self.current_edu.program else ""
            branch_name = self.current_edu.branch.name if self.current_edu.branch else ""
            if prog_name or branch_name:
                recipient_text += f"<br/>Program: {prog_name} ({branch_name})".strip(" ()")
        if self.contact and self.contact.permanent_address:
            recipient_text += f"<br/>{self.contact.permanent_address}"
        recipient_text += f"<br/>Email: {cand_email}"

        story.append(Paragraph(recipient_text, styles['MetaText']))
        story.append(Spacer(1, 8))

        # --- 5. SALUTATION ---
        salutation_name = self.student.first_name or full_name
        story.append(Paragraph(f"Dear <b>{salutation_name}</b>,", styles['FormalBody']))
        story.append(Spacer(1, 5))

        # --- 6. OPENING & CONGRATULATORY PARAGRAPHS ---
        comp_name = self.recruiter.company_name if self.recruiter else "Recruiting Organization"
        job_title = self.job.job_title

        p1_text = (
            f"We are pleased to inform you that your application for the position of <b>{job_title}</b> at "
            f"<b>{comp_name}</b> has been evaluated and successfully <b>SHORTLISTED</b> for the next stage of the "
            f"campus recruitment process through PLACENTRA Education."
        )
        story.append(Paragraph(p1_text, styles['FormalBody']))
        story.append(Spacer(1, 4))

        p2_text = (
            f"Congratulations on being shortlisted. Your profile and academic accomplishments have met the initial "
            f"eligibility requirements specified by <b>{comp_name}</b>."
        )
        story.append(Paragraph(p2_text, styles['FormalBody']))
        story.append(Spacer(1, 6))

        # --- 7. RECRUITMENT & APPLICATION DETAILS ---
        app_date_str = self.application.applied_at.strftime('%d %B %Y')
        details_data = [
            [Paragraph("Position Applied:", styles['DetailLabel']), Paragraph(f"<b>{job_title}</b>", styles['DetailValue'])],
            [Paragraph("Recruiting Organization:", styles['DetailLabel']), Paragraph(f"<b>{comp_name}</b>", styles['DetailValue'])],
            [Paragraph("Application Date:", styles['DetailLabel']), Paragraph(app_date_str, styles['DetailValue'])],
            [Paragraph("Shortlist Status:", styles['DetailLabel']), Paragraph("<b>SHORTLISTED</b>", styles['DetailValue'])],
        ]

        details_table = Table(details_data, colWidths=[130, 375])
        details_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 1.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5),
        ]))
        story.append(details_table)
        story.append(Spacer(1, 6))

        # --- 8. INTERVIEW SCHEDULE SECTION ---
        story.append(Paragraph("INTERVIEW DETAILS", styles['SectionHeading']))
        interview_info = self._get_interview_details()

        int_data = [
            [Paragraph("Interview Date:", styles['DetailLabel']), Paragraph(f"<b>{interview_info['date']}</b>", styles['DetailValue'])],
            [Paragraph("Interview Time:", styles['DetailLabel']), Paragraph(f"<b>{interview_info['time']}</b>", styles['DetailValue'])],
            [Paragraph("Mode / Venue:", styles['DetailLabel']), Paragraph(f"<b>{interview_info['venue']}</b>", styles['DetailValue'])],
        ]
        if interview_info.get('scheduled') and interview_info.get('description'):
            int_data.append([Paragraph("Drive Notes:", styles['DetailLabel']), Paragraph(interview_info['description'], styles['DetailValue'])])

        int_table = Table(int_data, colWidths=[130, 375])
        int_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 1.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5),
        ]))
        story.append(int_table)

        if not interview_info.get('scheduled'):
            story.append(Spacer(1, 2))
            story.append(Paragraph("<i>Note: Interview details will be shared through PLACENTRA once scheduled.</i>", styles['DisclaimerNotice']))

        story.append(Spacer(1, 6))

        # --- 9. NEXT STEPS / CANDIDATE INSTRUCTIONS ---
        story.append(Paragraph("NEXT STEPS", styles['SectionHeading']))
        instructions = [
            "1. Keep your PLACENTRA candidate profile information up to date.",
            "2. Monitor your registered email address regularly for recruitment updates.",
            "3. Be available at the scheduled interview date and time.",
            "4. Keep your official student ID card and academic certificates ready for verification."
        ]
        for inst in instructions:
            story.append(Paragraph(inst, styles['FormalBody']))
            story.append(Spacer(1, 1.5))

        story.append(Spacer(1, 6))

        # --- 10. IMPORTANT NOTICE / DISCLAIMER ---
        disclaimer_text = (
            "<b>IMPORTANT NOTICE:</b> This letter confirms that the candidate has been shortlisted for the "
            "recruitment process. It is not an employment offer, appointment letter, employment contract, or guarantee of employment."
        )
        story.append(Paragraph(disclaimer_text, styles['DisclaimerNotice']))
        story.append(Spacer(1, 8))

        # --- 11. FORMAL CLOSING & ISSUING AUTHORITY ---
        story.append(Paragraph("Sincerely,", styles['FormalBody']))
        story.append(Spacer(1, 2))
        story.append(Paragraph("<b>PLACENTRA Education</b>", styles['FormalBodyBold']))
        story.append(Paragraph("Campus Placement Office", styles['MetaText']))
        story.append(Spacer(1, 4))

        story.append(Paragraph("Enclosure: Candidate Shortlisting Details", styles['MetaText']))
        story.append(Spacer(1, 10))

        # --- 12. SIGNATURE & VERIFICATION AREA ---
        sig_table = Table([
            [
                Paragraph("__________________________________________", styles['SignatureLabel']),
                Paragraph("____________________", styles['SignatureLabel'])
            ],
            [
                Paragraph("Digitally Verified Document", styles['SignatureLabel']),
                Paragraph("Date", styles['SignatureLabel'])
            ],
            [
                Paragraph("Authorized Placement Office Signature", styles['InstSubHeader']),
                Paragraph("", styles['InstSubHeader'])
            ]
        ], colWidths=[330, 175])
        sig_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
        ]))
        story.append(sig_table)

        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=0.5, color=DIVIDER_COLOR, spaceAfter=4))
        story.append(Paragraph("PLACENTRA Education &bull; Campus Placement Office &bull; This is a system-generated Candidate Shortlisting Letter.", styles['FooterText']))

        # Build PDF
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes


def generate_shortlisting_pdf(application):
    """
    Helper function to generate PDF bytes for an Application instance.
    """
    generator = ShortlistingLetterPDFGenerator(application)
    return generator.generate()


class InterviewInvitationPDFGenerator:
    """
    Generates a formal A4 Candidate Interview Invitation Letter PDF.
    Contains candidate details, company, job title, interview type, date, time, duration, mode, venue/link, instructions, guidelines, and formal signature block.
    Strictly consumes real Django Interview model instance.
    Optimized for single page ReportLab document.
    """

    def __init__(self, interview):
        self.interview = interview
        self.application = interview.application
        self.student = self.application.student
        self.job = self.application.job
        self.recruiter = getattr(self.job, 'recruiter', None)
        self.institution = getattr(self.student, 'institution', None)
        self.current_edu = getattr(self.student, 'current_education', None)
        self.contact = getattr(self.student, 'contact', None)

    def generate(self):
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=45,
            rightMargin=45,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        PRIMARY_NAVY = colors.HexColor('#1E3A8A')
        TEXT_DARK = colors.HexColor('#111827')
        TEXT_MUTED = colors.HexColor('#4B5563')
        DIVIDER_COLOR = colors.HexColor('#94A3B8')

        styles.add(ParagraphStyle(
            name='InstHeader',
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=18,
            textColor=PRIMARY_NAVY,
            alignment=1
        ))
        styles.add(ParagraphStyle(
            name='InstSubHeader',
            fontName='Helvetica',
            fontSize=9,
            leading=11,
            textColor=TEXT_MUTED,
            alignment=1
        ))
        styles.add(ParagraphStyle(
            name='LetterTitle',
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=15,
            textColor=PRIMARY_NAVY,
            alignment=1,
            spaceAfter=1
        ))
        styles.add(ParagraphStyle(
            name='LetterSubTitle',
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            textColor=TEXT_MUTED,
            alignment=1
        ))
        styles.add(ParagraphStyle(
            name='MetaText',
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=TEXT_DARK
        ))
        styles.add(ParagraphStyle(
            name='FormalBody',
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=TEXT_DARK,
            alignment=4
        ))
        styles.add(ParagraphStyle(
            name='FormalBodyBold',
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=13.5,
            textColor=TEXT_DARK
        ))
        styles.add(ParagraphStyle(
            name='SectionHeading',
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=PRIMARY_NAVY,
            spaceBefore=3,
            spaceAfter=2
        ))
        styles.add(ParagraphStyle(
            name='DetailLabel',
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12.5,
            textColor=TEXT_DARK
        ))
        styles.add(ParagraphStyle(
            name='DetailValue',
            fontName='Helvetica',
            fontSize=9,
            leading=12.5,
            textColor=TEXT_DARK
        ))
        styles.add(ParagraphStyle(
            name='DisclaimerNotice',
            fontName='Helvetica-Oblique',
            fontSize=8.5,
            leading=11,
            textColor=TEXT_MUTED
        ))
        styles.add(ParagraphStyle(
            name='SignatureLabel',
            fontName='Helvetica',
            fontSize=8.5,
            leading=11,
            textColor=TEXT_MUTED
        ))
        styles.add(ParagraphStyle(
            name='FooterText',
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=TEXT_MUTED,
            alignment=1
        ))

        story = []

        # Letterhead
        inst_name = self.institution.institution_name if self.institution else "PLACENTRA Education Partner Campus"
        story.append(Paragraph("PLACENTRA Education", styles['InstHeader']))
        story.append(Paragraph(f"Campus Placement Office &bull; {inst_name}", styles['InstSubHeader']))
        story.append(Spacer(1, 4))
        story.append(HRFlowable(width="100%", thickness=1.0, color=DIVIDER_COLOR, spaceAfter=6))

        # Title
        interview_type = self.interview.interview_type
        story.append(Paragraph("CANDIDATE INTERVIEW INVITATION LETTER", styles['LetterTitle']))
        story.append(Paragraph(f"{interview_type.upper()} SCHEDULE &amp; INSTRUCTIONS", styles['LetterSubTitle']))
        story.append(Spacer(1, 6))

        # Date & Ref
        issue_date = datetime.now().strftime('%d %B %Y')
        ref_no = f"PLC-INT-{self.interview.id:06d}"
        meta_table = Table([
            [
                Paragraph(f"<b>Date:</b> {issue_date}", styles['MetaText']),
                Paragraph(f"<b>Reference No.:</b> {ref_no}", styles['MetaText'])
            ]
        ], colWidths=[250, 255])
        meta_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 8))

        # Recipient
        full_name = f"{self.student.first_name} {self.student.middle_name} {self.student.last_name}".replace("  ", " ").strip()
        reg_no = self.student.register_number or "N/A"
        cand_email = getattr(self.student.user, 'email', None) or (self.contact.primary_email if self.contact else "N/A")

        recipient_text = f"To,<br/><b>{full_name}</b><br/>Register / Roll No: {reg_no}<br/>Institution: {inst_name}"
        if self.current_edu:
            prog_name = self.current_edu.program.name if self.current_edu.program else ""
            branch_name = self.current_edu.branch.name if self.current_edu.branch else ""
            if prog_name or branch_name:
                recipient_text += f"<br/>Program: {prog_name} ({branch_name})".strip(" ()")
        recipient_text += f"<br/>Email: {cand_email}"

        story.append(Paragraph(recipient_text, styles['MetaText']))
        story.append(Spacer(1, 8))

        # Salutation & Body
        salutation_name = self.student.first_name or full_name
        story.append(Paragraph(f"Dear <b>{salutation_name}</b>,", styles['FormalBody']))
        story.append(Spacer(1, 5))

        comp_name = self.recruiter.company_name if self.recruiter else "Recruiting Organization"
        job_title = self.job.job_title

        p1_text = (
            f"You are formally invited to attend your <b>{interview_type}</b> for the position of <b>{job_title}</b> at "
            f"<b>{comp_name}</b> through PLACENTRA Education Campus Placement Office."
        )
        story.append(Paragraph(p1_text, styles['FormalBody']))
        story.append(Spacer(1, 6))

        # Schedule Table
        story.append(Paragraph("INTERVIEW SCHEDULE DETAILS", styles['SectionHeading']))
        date_str = self.interview.interview_date.strftime('%d %B %Y') if self.interview.interview_date else "N/A"
        time_str = self.interview.interview_time.strftime('%I:%M %p') if self.interview.interview_time else "N/A"
        duration_str = f"{self.interview.duration_minutes} minutes" if self.interview.duration_minutes else "30 minutes"
        mode_str = self.interview.mode or "Online"
        location_str = self.interview.location_or_link or "Meeting link / venue will be provided by employer."
        instructions_str = self.interview.instructions or "Please be available on time with your required setup."

        int_data = [
            [Paragraph("Interview Round:", styles['DetailLabel']), Paragraph(f"<b>{interview_type}</b>", styles['DetailValue'])],
            [Paragraph("Position:", styles['DetailLabel']), Paragraph(f"<b>{job_title}</b>", styles['DetailValue'])],
            [Paragraph("Organization:", styles['DetailLabel']), Paragraph(f"<b>{comp_name}</b>", styles['DetailValue'])],
            [Paragraph("Interview Date:", styles['DetailLabel']), Paragraph(f"<b>{date_str}</b>", styles['DetailValue'])],
            [Paragraph("Interview Time:", styles['DetailLabel']), Paragraph(f"<b>{time_str}</b> ({duration_str})", styles['DetailValue'])],
            [Paragraph("Mode of Interview:", styles['DetailLabel']), Paragraph(f"<b>{mode_str}</b>", styles['DetailValue'])],
            [Paragraph("Venue / Link:", styles['DetailLabel']), Paragraph(f"<b>{location_str}</b>", styles['DetailValue'])],
            [Paragraph("Instructions:", styles['DetailLabel']), Paragraph(instructions_str, styles['DetailValue'])],
        ]

        int_table = Table(int_data, colWidths=[130, 375])
        int_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 1.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5),
        ]))
        story.append(int_table)
        story.append(Spacer(1, 6))

        # Instructions
        story.append(Paragraph("IMPORTANT CANDIDATE GUIDELINES", styles['SectionHeading']))
        guidelines = [
            "1. Please ensure you are connected/present at least 10 minutes prior to the scheduled time.",
            "2. For online interviews, ensure a stable internet connection, functional camera, and working microphone.",
            "3. Keep your official student ID card and updated resume ready for presentation.",
            "4. Dress formally in standard business attire."
        ]
        for g in guidelines:
            story.append(Paragraph(g, styles['FormalBody']))
            story.append(Spacer(1, 1.5))

        story.append(Spacer(1, 6))

        disclaimer_text = (
            "<b>NOTICE:</b> This document serves as an official interview invitation letter for the specified recruitment round. "
            "It does not guarantee final employment or job placement."
        )
        story.append(Paragraph(disclaimer_text, styles['DisclaimerNotice']))
        story.append(Spacer(1, 8))

        # Closing & Signatures
        story.append(Paragraph("Sincerely,", styles['FormalBody']))
        story.append(Spacer(1, 2))
        story.append(Paragraph("<b>PLACENTRA Education</b>", styles['FormalBodyBold']))
        story.append(Paragraph("Campus Placement Office", styles['MetaText']))
        story.append(Spacer(1, 10))

        sig_table = Table([
            [
                Paragraph("__________________________________________", styles['SignatureLabel']),
                Paragraph("____________________", styles['SignatureLabel'])
            ],
            [
                Paragraph("Digitally Verified Document", styles['SignatureLabel']),
                Paragraph("Date", styles['SignatureLabel'])
            ],
            [
                Paragraph("Authorized Placement Office Signature", styles['InstSubHeader']),
                Paragraph("", styles['InstSubHeader'])
            ]
        ], colWidths=[330, 175])
        sig_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
        ]))
        story.append(sig_table)
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=0.5, color=DIVIDER_COLOR, spaceAfter=4))
        story.append(Paragraph("PLACENTRA Education &bull; Campus Placement Office &bull; System-Generated Interview Invitation Letter.", styles['FooterText']))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes


def generate_interview_invitation_pdf(interview):
    """
    Helper function to generate PDF bytes for an Interview instance.
    """
    generator = InterviewInvitationPDFGenerator(interview)
    return generator.generate()
