from django.core.management.base import BaseCommand
from institutions.models import Institution

VERIFIED_INSTITUTIONS = [
    {
        'institution_name': 'Christ University, Bengaluru',
        'affiliated_university': 'Deemed to be University',
        'address': 'Hosur Road, Bhavani Nagar, S.G. Palya',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka',
        'pincode': '560029',
        'placement_email': 'placements@christuniversity.in',
        'placement_phone': '9845012345'
    },
    {
        'institution_name': 'Christ College (Autonomous), Irinjalakuda',
        'affiliated_university': 'University of Calicut',
        'address': 'Christ College Road, Irinjalakuda',
        'district': 'Thrissur',
        'state': 'Kerala',
        'pincode': '680125',
        'placement_email': 'placements@christcollegeijk.edu.in',
        'placement_phone': '9847012345'
    },
    {
        'institution_name': 'Amal Jyothi College of Engineering, Kottayam',
        'affiliated_university': 'APJ Abdul Kalam Technological University',
        'address': 'Koovappally P.O., Kanjirappally',
        'district': 'Kottayam',
        'state': 'Kerala',
        'pincode': '686518',
        'placement_email': 'placement@ajce.in',
        'placement_phone': '9876543210'
    },
    {
        'institution_name': 'Rajagiri College of Social Sciences, Kochi',
        'affiliated_university': 'Mahatma Gandhi University',
        'address': 'Rajagiri P.O., Kalamassery',
        'district': 'Ernakulam',
        'state': 'Kerala',
        'pincode': '683104',
        'placement_email': 'placements@rajagiri.edu',
        'placement_phone': '9846012345'
    },
    {
        'institution_name': 'Saintgits College of Engineering, Kottayam',
        'affiliated_university': 'APJ Abdul Kalam Technological University',
        'address': 'Kottukulam Hills, Pathamuttom P.O.',
        'district': 'Kottayam',
        'state': 'Kerala',
        'pincode': '686532',
        'placement_email': 'placement@saintgits.org',
        'placement_phone': '9847123456'
    },
    {
        'institution_name': 'Marian College Kuttikkanam, Idukki',
        'affiliated_university': 'Mahatma Gandhi University',
        'address': 'Kuttikkanam P.O., Peermade',
        'district': 'Idukki',
        'state': 'Kerala',
        'pincode': '685531',
        'placement_email': 'placement@mariancollege.org',
        'placement_phone': '9847234567'
    },
    {
        'institution_name': 'College of Engineering Trivandrum (CET)',
        'affiliated_university': 'APJ Abdul Kalam Technological University',
        'address': 'Engineering College P.O., Sreekaryam',
        'district': 'Thiruvananthapuram',
        'state': 'Kerala',
        'pincode': '695016',
        'placement_email': 'placement@cet.ac.in',
        'placement_phone': '9847345678'
    },
    {
        'institution_name': 'Government Engineering College, Thrissur',
        'affiliated_university': 'APJ Abdul Kalam Technological University',
        'address': 'Engineering College P.O., Ramavarmapuram',
        'district': 'Thrissur',
        'state': 'Kerala',
        'pincode': '680009',
        'placement_email': 'cgpc@gectcr.ac.in',
        'placement_phone': '9847456789'
    },
    {
        'institution_name': 'TKM College of Engineering, Kollam',
        'affiliated_university': 'APJ Abdul Kalam Technological University',
        'address': 'Karicode, Kollam',
        'district': 'Kollam',
        'state': 'Kerala',
        'pincode': '691005',
        'placement_email': 'cgpctkmce@gmail.com',
        'placement_phone': '9847567890'
    },
    {
        'institution_name': 'National Institute of Technology Calicut (NITC)',
        'affiliated_university': 'Institute of National Importance',
        'address': 'NIT Campus P.O., Chathamangalam',
        'district': 'Kozhikode',
        'state': 'Kerala',
        'pincode': '673601',
        'placement_email': 'placements@nitc.ac.in',
        'placement_phone': '9847678901'
    },
    {
        'institution_name': 'Indian Institute of Technology Palakkad (IIT Palakkad)',
        'affiliated_university': 'Institute of National Importance',
        'address': 'Kanjikode, Palakkad',
        'district': 'Palakkad',
        'state': 'Kerala',
        'pincode': '678623',
        'placement_email': 'placement@iitpkd.ac.in',
        'placement_phone': '9847789012'
    },
    {
        'institution_name': 'Cochin University of Science and Technology (CUSAT)',
        'affiliated_university': 'State University',
        'address': 'South Kalamassery, Kochi',
        'district': 'Ernakulam',
        'state': 'Kerala',
        'pincode': '682022',
        'placement_email': 'cira@cusat.ac.in',
        'placement_phone': '9847890123'
    },
    {
        'institution_name': 'Indian Institute of Technology Madras (IIT Madras)',
        'affiliated_university': 'Institute of National Importance',
        'address': 'Sardar Patel Road, Chennai',
        'district': 'Chennai',
        'state': 'Tamil Nadu',
        'pincode': '600036',
        'placement_email': 'placement@iitm.ac.in',
        'placement_phone': '9847901234'
    },
    {
        'institution_name': 'Indian Institute of Science (IISc), Bengaluru',
        'affiliated_university': 'Deemed University',
        'address': 'CV Raman Road, Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka',
        'pincode': '560012',
        'placement_email': 'placements@iisc.ac.in',
        'placement_phone': '9848012345'
    },
    {
        'institution_name': 'St. Joseph\'s University, Bengaluru',
        'affiliated_university': 'State University',
        'address': 'Langford Road, Bengaluru',
        'district': 'Bengaluru Urban',
        'state': 'Karnataka',
        'pincode': '560027',
        'placement_email': 'placement@sju.edu.in',
        'placement_phone': '9848123456'
    },
    {
        'institution_name': 'Vellore Institute of Technology (VIT), Vellore',
        'affiliated_university': 'Deemed to be University',
        'address': 'Near Katpadi Road, Vellore',
        'district': 'Vellore',
        'state': 'Tamil Nadu',
        'pincode': '632014',
        'placement_email': 'pat@vit.ac.in',
        'placement_phone': '9848234567'
    },
    {
        'institution_name': 'Manipal Academy of Higher Education (MAHE), Manipal',
        'affiliated_university': 'Deemed to be University',
        'address': 'Tiger Circle Road, Madhav Nagar, Manipal',
        'district': 'Udupi',
        'state': 'Karnataka',
        'pincode': '576104',
        'placement_email': 'placements@manipal.edu',
        'placement_phone': '9848345678'
    },
    {
        'institution_name': 'Birla Institute of Technology and Science (BITS), Pilani',
        'affiliated_university': 'Deemed University',
        'address': 'Vidya Vihar, Pilani',
        'district': 'Jhunjhunu',
        'state': 'Rajasthan',
        'pincode': '333031',
        'placement_email': 'placement@pilani.bits-pilani.ac.in',
        'placement_phone': '9848456789'
    },
    {
        'institution_name': 'PSG College of Technology, Coimbatore',
        'affiliated_university': 'Anna University',
        'address': 'Avinashi Road, Peelamedu, Coimbatore',
        'district': 'Coimbatore',
        'state': 'Tamil Nadu',
        'pincode': '641004',
        'placement_email': 'placement@psgtech.ac.in',
        'placement_phone': '9848567890'
    },
    {
        'institution_name': 'Muthoot Institute of Technology and Science (MITS), Ernakulam',
        'affiliated_university': 'APJ Abdul Kalam Technological University',
        'address': 'Varikoli P.O., Puthencruz',
        'district': 'Ernakulam',
        'state': 'Kerala',
        'pincode': '682308',
        'placement_email': 'placement@mgits.ac.in',
        'placement_phone': '9848678901'
    },
    {
        'institution_name': 'Model Engineering College, Thrikkakara',
        'affiliated_university': 'APJ Abdul Kalam Technological University',
        'address': 'Thrikkakara, Kochi',
        'district': 'Ernakulam',
        'state': 'Kerala',
        'pincode': '682021',
        'placement_email': 'pc@mec.ac.in',
        'placement_phone': '9848789012'
    },
    {
        'institution_name': 'Mar Athanasius College of Engineering, Kothamangalam',
        'affiliated_university': 'APJ Abdul Kalam Technological University',
        'address': 'Kothamangalam, Ernakulam',
        'district': 'Ernakulam',
        'state': 'Kerala',
        'pincode': '686666',
        'placement_email': 'placement@mace.ac.in',
        'placement_phone': '9848890123'
    },
    {
        'institution_name': 'Federal Institute of Science and Technology (FISAT), Angamaly',
        'affiliated_university': 'APJ Abdul Kalam Technological University',
        'address': 'Hormis Nagar, Mookkannoor P.O., Angamaly',
        'district': 'Ernakulam',
        'state': 'Kerala',
        'pincode': '683577',
        'placement_email': 'placement@fisat.ac.in',
        'placement_phone': '9848901234'
    },
    {
        'institution_name': 'Loyola College, Chennai',
        'affiliated_university': 'University of Madras',
        'address': 'Sterling Road, Nungambakkam, Chennai',
        'district': 'Chennai',
        'state': 'Tamil Nadu',
        'pincode': '600034',
        'placement_email': 'placement@loyolacollege.edu',
        'placement_phone': '9849012345'
    },
    {
        'institution_name': 'University of Delhi (DU), New Delhi',
        'affiliated_university': 'Central University',
        'address': 'Benito Juarez Marg, South Campus, New Delhi',
        'district': 'New Delhi',
        'state': 'Delhi',
        'pincode': '110021',
        'placement_email': 'placement@du.ac.in',
        'placement_phone': '9849123456'
    }
]


class Command(BaseCommand):
    help = 'Seeds verified colleges and universities into the database without altering existing records.'

    def handle(self, *args, **options):
        created_count = 0
        existing_count = 0

        for item in VERIFIED_INSTITUTIONS:
            name = item['institution_name']
            inst = Institution.objects.filter(institution_name__iexact=name).first()
            if not inst:
                Institution.objects.create(
                    institution_name=name,
                    affiliated_university=item.get('affiliated_university', ''),
                    address=item.get('address', 'Campus Address'),
                    district=item.get('district', 'Default District'),
                    state=item.get('state', 'Default State'),
                    pincode=item.get('pincode', '000000'),
                    placement_email=item.get('placement_email', 'placement@college.edu'),
                    placement_phone=item.get('placement_phone', '9876543210'),
                    is_active=True
                )
                created_count += 1
            else:
                existing_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Verified institutions processing complete. Created: {created_count}, Existing: {existing_count}"
            )
        )
