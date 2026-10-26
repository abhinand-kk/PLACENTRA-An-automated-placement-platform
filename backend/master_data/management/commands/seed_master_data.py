import logging
from django.core.management.base import BaseCommand
from django.db import transaction
from master_data.models import (
    HiringType,
    EmploymentType,
    WorkMode,
    TargetJobRole,
    Program,
    Branch,
    QualificationType,
    InstitutionType,
)

logger = logging.getLogger('placentra')

DEFAULT_HIRING_TYPES = [
    'Direct',
    'Campus Placement',
    'Internship to Hire',
    'Off-Campus',
]

DEFAULT_EMPLOYMENT_TYPES = [
    'Full Time',
    'Part Time',
    'Internship',
    'Contract',
]

DEFAULT_WORK_MODES = [
    'On-Site',
    'Remote',
    'Hybrid',
]

DEFAULT_TARGET_JOB_ROLES = [
    'Software Engineer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Data Analyst',
    'Data Scientist',
    'Machine Learning Engineer',
    'Cloud / DevOps Engineer',
    'QA / Automation Engineer',
    'Cybersecurity Analyst',
    'Product Manager',
    'UI/UX Designer',
]

DEFAULT_QUALIFICATION_TYPES = [
    'Secondary School (10th)',
    'Higher Secondary (12th)',
    'Diploma',
    'Undergraduate (UG)',
    'Postgraduate (PG)',
    'Doctorate (Ph.D)',
]

DEFAULT_INSTITUTION_TYPES = [
    'University',
    'Autonomous College',
    'Affiliated College',
    'Institute of National Importance',
]

DEFAULT_ACADEMIC_STRUCTURE = {
    'B.Tech': [
        'Computer Science and Engineering',
        'Information Technology',
        'Electronics and Communication Engineering',
        'Electrical and Electronics Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Artificial Intelligence and Data Science',
    ],
    'MCA': [
        'Computer Applications',
        'Data Analytics',
        'Cloud Computing',
    ],
    'BCA': [
        'Computer Applications',
    ],
    'M.Tech': [
        'Computer Science and Engineering',
        'VLSI Design',
        'Cyber Security',
    ],
    'B.Sc': [
        'Computer Science',
        'Information Technology',
    ],
}


class Command(BaseCommand):
    help = (
        'Idempotently seeds master data required for PLACENTRA operations '
        '(Hiring Types, Employment Types, Work Modes, Job Roles, Programs, Branches, Qualifications).'
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting master data seeding...'))
        summary = {}

        with transaction.atomic():
            # 1. Hiring Types
            summary['HiringType'] = self._seed_simple_model(
                HiringType, DEFAULT_HIRING_TYPES
            )

            # 2. Employment Types
            summary['EmploymentType'] = self._seed_simple_model(
                EmploymentType, DEFAULT_EMPLOYMENT_TYPES
            )

            # 3. Work Modes
            summary['WorkMode'] = self._seed_simple_model(
                WorkMode, DEFAULT_WORK_MODES
            )

            # 4. Target Job Roles
            summary['TargetJobRole'] = self._seed_simple_model(
                TargetJobRole, DEFAULT_TARGET_JOB_ROLES
            )

            # 5. Qualification Types
            summary['QualificationType'] = self._seed_simple_model(
                QualificationType, DEFAULT_QUALIFICATION_TYPES
            )

            # 6. Institution Types
            summary['InstitutionType'] = self._seed_simple_model(
                InstitutionType, DEFAULT_INSTITUTION_TYPES
            )

            # 7. Programs & Branches
            prog_created, prog_existing, br_created, br_existing = self._seed_academic_structure(
                DEFAULT_ACADEMIC_STRUCTURE
            )
            summary['Program'] = {'created': prog_created, 'existing': prog_existing}
            summary['Branch'] = {'created': br_created, 'existing': br_existing}

        # Print summary
        self.stdout.write(self.style.SUCCESS('\n=== Master Data Seeding Summary ==='))
        for model_name, counts in summary.items():
            self.stdout.write(
                f"  {model_name:<18}: {counts['created']} created, {counts['existing']} existing"
            )
        self.stdout.write(self.style.SUCCESS('Master data seeding completed successfully!\n'))

    def _seed_simple_model(self, model_class, name_list):
        created_count = 0
        existing_count = 0

        for item_name in name_list:
            # Check case-insensitively first to avoid near-duplicate collisions
            existing = model_class.objects.filter(name__iexact=item_name).first()
            if existing:
                existing_count += 1
            else:
                model_class.objects.create(name=item_name)
                created_count += 1

        return {'created': created_count, 'existing': existing_count}

    def _seed_academic_structure(self, structure):
        prog_created = 0
        prog_existing = 0
        br_created = 0
        br_existing = 0

        for prog_name, branches in structure.items():
            program = Program.objects.filter(name__iexact=prog_name).first()
            if program:
                prog_existing += 1
            else:
                program = Program.objects.create(name=prog_name)
                prog_created += 1

            for branch_name in branches:
                branch = Branch.objects.filter(
                    program=program, name__iexact=branch_name
                ).first()
                if branch:
                    br_existing += 1
                else:
                    Branch.objects.create(program=program, name=branch_name)
                    br_created += 1

        return prog_created, prog_existing, br_created, br_existing
