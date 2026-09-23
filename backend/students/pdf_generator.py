import io
import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class StudentResumePDFGenerator:
    """
    Generates a professional A4 PDF Resume for a PLACENTRA student profile.
    Strictly consumes real Django database model instances.
    """
    def __init__(self, student_profile):
        self.profile = student_profile

    def generate(self):
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=36,  # 0.5 inch margins
            rightMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Color Palette
        PRIMARY_COLOR = colors.HexColor('#1E3A8A')    # Navy Deep Blue
        SECONDARY_COLOR = colors.HexColor('#3B82F6')  # Royal Blue
        TEXT_DARK = colors.HexColor('#1F2937')        # Dark Slate
        TEXT_MUTED = colors.HexColor('#4B5563')       # Gray
        BG_LIGHT = colors.HexColor('#F8FAFC')         # Off-white

        # Custom Paragraph Styles
        styles.add(ParagraphStyle(
            name='CandidateName',
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=PRIMARY_COLOR
        ))
        
        styles.add(ParagraphStyle(
            name='SubHeaderInfo',
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=TEXT_MUTED
        ))

        styles.add(ParagraphStyle(
            name='SectionHeading',
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=15,
            textColor=PRIMARY_COLOR,
            spaceAfter=4
        ))

        styles.add(ParagraphStyle(
            name='BodyDark',
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=TEXT_DARK
        ))

        styles.add(ParagraphStyle(
            name='BodyDarkBold',
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=13,
            textColor=TEXT_DARK
        ))

        styles.add(ParagraphStyle(
            name='TableHead',
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            textColor=colors.white,
            alignment=0
        ))

        styles.add(ParagraphStyle(
            name='TableCell',
            fontName='Helvetica',
            fontSize=8.5,
            leading=11,
            textColor=TEXT_DARK
        ))

        story = []

        # --- HEADER SECTION ---
        full_name = f"{self.profile.first_name} {self.profile.middle_name} {self.profile.last_name}".replace("  ", " ").strip()
        reg_no = self.profile.register_number
        inst_name = self.profile.institution.institution_name if (self.profile.institution and hasattr(self.profile.institution, 'institution_name')) else str(self.profile.institution or "")


        contact_info = []
        if hasattr(self.profile, 'contact') and self.profile.contact:
            c = self.profile.contact
            if c.primary_email:
                contact_info.append(f"<b>Email:</b> {c.primary_email}")
            if c.mobile_number:
                contact_info.append(f"<b>Phone:</b> {c.mobile_number}")
            location_parts = [p for p in [c.city, c.district, c.state, c.country] if p]
            if location_parts:
                contact_info.append(f"<b>Location:</b> {', '.join(location_parts)}")

        contact_str = " &nbsp;|&nbsp; ".join(contact_info)

        header_text = [
            Paragraph(full_name, styles['CandidateName']),
            Spacer(1, 2),
            Paragraph(f"<b>Reg No:</b> {reg_no} &nbsp;|&nbsp; <b>Institution:</b> {inst_name}", styles['SubHeaderInfo']),
        ]
        if contact_str:
            header_text.extend([
                Spacer(1, 2),
                Paragraph(contact_str, styles['SubHeaderInfo'])
            ])

        # Check for profile photo
        photo_element = None
        if self.profile.profile_photo:
            try:
                photo_path = self.profile.profile_photo.path
                if os.path.exists(photo_path):
                    photo_element = Image(photo_path, width=0.95*inch, height=1.15*inch)
            except Exception:
                photo_element = None

        if photo_element:
            header_table = Table([[header_text, photo_element]], colWidths=[420, 100])
            header_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ]))
            story.append(header_table)
        else:
            for item in header_text:
                story.append(item)

        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY_COLOR, spaceAfter=10))

        # --- PERSONAL DETAILS ---
        story.append(Paragraph("PERSONAL DETAILS", styles['SectionHeading']))
        personal_data = [
            [
                Paragraph("<b>Date of Birth:</b>", styles['BodyDarkBold']),
                Paragraph(str(self.profile.date_of_birth or "N/A"), styles['BodyDark']),
                Paragraph("<b>Gender:</b>", styles['BodyDarkBold']),
                Paragraph(str(self.profile.gender or "N/A"), styles['BodyDark']),
            ],
            [
                Paragraph("<b>Blood Group:</b>", styles['BodyDarkBold']),
                Paragraph(str(self.profile.blood_group or "N/A"), styles['BodyDark']),
                Paragraph("<b>Completion Status:</b>", styles['BodyDarkBold']),
                Paragraph(f"{self.profile.profile_completion}% Completed", styles['BodyDark']),
            ]
        ]
        if hasattr(self.profile, 'contact') and self.profile.contact and self.profile.contact.permanent_address:
            personal_data.append([
                Paragraph("<b>Address:</b>", styles['BodyDarkBold']),
                Paragraph(self.profile.contact.permanent_address, styles['BodyDark']),
                Paragraph("", styles['BodyDark']),
                Paragraph("", styles['BodyDark']),
            ])

        personal_table = Table(personal_data, colWidths=[100, 160, 110, 150])
        personal_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('SPAN', (1, 2), (3, 2)) if len(personal_data) > 2 else ('NOP', (0,0), (0,0)),
        ]))
        story.append(personal_table)
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey, spaceAfter=8))

        # --- CURRENT EDUCATION ---
        story.append(Paragraph("CURRENT EDUCATION", styles['SectionHeading']))
        if hasattr(self.profile, 'current_education') and self.profile.current_education:
            edu = self.profile.current_education
            prog_name = edu.program.name if edu.program else ""
            branch_name = edu.branch.name if edu.branch else ""
            
            curr_edu_data = [
                [
                    Paragraph("<b>Program / Degree:</b>", styles['BodyDarkBold']),
                    Paragraph(f"{prog_name} ({branch_name})", styles['BodyDark']),
                    Paragraph("<b>Field of Study:</b>", styles['BodyDarkBold']),
                    Paragraph(edu.field_of_study or "N/A", styles['BodyDark']),
                ],
                [
                    Paragraph("<b>Batch / Semester:</b>", styles['BodyDarkBold']),
                    Paragraph(f"Batch {edu.batch} | Sem {edu.semester}", styles['BodyDark']),
                    Paragraph("<b>CGPA:</b>", styles['BodyDarkBold']),
                    Paragraph(f"<b>{edu.cgpa}</b> / 10.00", styles['BodyDark']),
                ],
                [
                    Paragraph("<b>Active Backlogs:</b>", styles['BodyDarkBold']),
                    Paragraph(str(edu.active_backlogs), styles['BodyDark']),
                    Paragraph("<b>Duration:</b>", styles['BodyDarkBold']),
                    Paragraph(f"{edu.start_date} to {edu.end_date}", styles['BodyDark']),
                ]
            ]
            curr_edu_table = Table(curr_edu_data, colWidths=[110, 150, 100, 160])
            curr_edu_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
            ]))
            story.append(curr_edu_table)
        else:
            story.append(Paragraph("Current education details not provided.", styles['SubHeaderInfo']))

        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey, spaceAfter=8))

        # --- PREVIOUS ACADEMICS ---
        story.append(Paragraph("PREVIOUS ACADEMIC QUALIFICATIONS", styles['SectionHeading']))
        prev_edus = self.profile.previous_educations.all()
        if prev_edus.exists():
            table_rows = [
                [
                    Paragraph("Qualification", styles['TableHead']),
                    Paragraph("Institution / School", styles['TableHead']),
                    Paragraph("Board / University", styles['TableHead']),
                    Paragraph("Year", styles['TableHead']),
                    Paragraph("Score", styles['TableHead']),
                ]
            ]
            for item in prev_edus:
                q_name = item.qualification_type.name if item.qualification_type else "N/A"
                table_rows.append([
                    Paragraph(q_name, styles['TableCell']),
                    Paragraph(item.institution_name, styles['TableCell']),
                    Paragraph(item.board_or_university, styles['TableCell']),
                    Paragraph(str(item.year_of_passing), styles['TableCell']),
                    Paragraph(f"{item.percentage}%", styles['TableCell']),
                ])

            prev_table = Table(table_rows, colWidths=[110, 150, 140, 50, 70])
            prev_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_COLOR),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, BG_LIGHT]),
            ]))
            story.append(prev_table)
        else:
            story.append(Paragraph("No previous academic qualification records provided.", styles['SubHeaderInfo']))

        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey, spaceAfter=8))

        # --- WORK / INTERNSHIP EXPERIENCE ---
        story.append(Paragraph("WORK & INTERNSHIP EXPERIENCE", styles['SectionHeading']))
        experiences = self.profile.experiences.all()
        if experiences.exists():
            for exp in experiences:
                emp_type = exp.employment_type.name if exp.employment_type else "Job"
                end_str = str(exp.end_date) if exp.end_date else "Present"
                date_str = f"{exp.start_date} – {end_str}"
                
                exp_header = f"<b>{exp.designation}</b> – {exp.company_name} <font color='#4B5563'>({emp_type})</font>"
                story.append(Paragraph(exp_header, styles['BodyDark']))
                story.append(Paragraph(f"<i>{exp.location} | {date_str}</i>", styles['SubHeaderInfo']))
                if exp.description:
                    story.append(Spacer(1, 2))
                    story.append(Paragraph(exp.description, styles['TableCell']))
                story.append(Spacer(1, 6))
        else:
            story.append(Paragraph("No internship or work experience recorded.", styles['SubHeaderInfo']))

        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey, spaceAfter=8))

        # --- VERIFICATION DOCUMENTS ---
        story.append(Paragraph("VERIFICATION DOCUMENTS STATUS", styles['SectionHeading']))
        doc_status = []
        if hasattr(self.profile, 'documents') and self.profile.documents:
            docs = self.profile.documents
            doc_status.append(f"<b>Resume Document:</b> {'Uploaded' if docs.resume else 'Not Uploaded'}")
            doc_status.append(f"<b>Class 10 Certificate:</b> {'Uploaded' if docs.class10_certificate else 'Not Uploaded'}")
            doc_status.append(f"<b>Class 12 Certificate:</b> {'Uploaded' if docs.class12_certificate else 'Not Uploaded'}")
            doc_status.append(f"<b>Degree Marksheet:</b> {'Uploaded' if docs.degree_marksheet else 'Not Uploaded'}")
        else:
            doc_status.append("No verification documents uploaded yet.")

        story.append(Paragraph(" &nbsp;|&nbsp; ".join(doc_status), styles['SubHeaderInfo']))

        # Build PDF Document
        doc.build(story)
        pdf_value = buffer.getvalue()
        buffer.close()
        return pdf_value
