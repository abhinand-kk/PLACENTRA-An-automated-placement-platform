export const initialStudentRegistrationState = {
  basicDetails: {
    firstName: 'Abhinand',
    middleName: 'K K',
    lastName: 'K K',
    dob: '2004-06-01',
    gender: 'Male',
    bloodGroup: 'B+',
    college: 'Amal Jyothi College of Engineering, Kottayam',
    course: 'MCA (Integrated)',
    branch: 'Computer Applications',
    rollNumber: 'AJC25MCA2002',
    currentSemester: '3',
    admissionYear: '2024',
    primaryEmail: 'kkabhinand05@gmail.com',
    mobileNumber: '916235407730'
  },
  contactVerification: {
    primaryEmailVerified: true,
    personalEmail: 'kkabhinand05@gmail.com',
    personalEmailVerified: true,
    mobileVerified: true,
    address: {
      country: 'India',
      pincode: '686518',
      state: 'Kerala',
      district: 'Kottayam',
      city: 'Kanjirapally',
      addressLine: 'Amal Jyothi College of Engineering'
    },
    sameAsPermanent: false
  },
  currentEducation: {
    status: 'pursuing', // 'pursuing' | 'completed'
    fieldOfStudy: 'Computer Applications',
    program: 'MCA (Integrated)',
    major: 'Artificial Intelligence',
    startDate: '2023-08',
    expectedEndDate: '2028-05',
    batch: '2023 - 2028',
    currentSemester: '3',
    percentage: '88.50',
    scoreType: '%',
    totalBacklogs: '0'
  },
  previousEducation: {
    class12: {
      board: 'CBSE',
      schoolName: 'Delhi Public School, Kochi',
      yearOfPassing: '2024',
      percentage: '92.40',
      maxMarks: '500',
      obtainedMarks: '462',
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science']
    },
    class10: {
      board: 'ICSE',
      schoolName: "St. George's High School, Kochi",
      yearOfPassing: '2022',
      percentage: '94.20',
      maxMarks: '500',
      obtainedMarks: '471'
    },
    additionalQualifications: [
      {
        id: '1',
        type: 'Diploma',
        institution: 'Govt. Polytechnic College, Kalamassery',
        year: '2021',
        score: '89.65%'
      }
    ]
  },
  experiences: [
    {
      id: '1',
      type: 'Internship',
      company: 'M2 Squared Software and Services Pvt Ltd',
      jobTitle: 'Web Developer Intern',
      startDate: '2024-06-15',
      endDate: '2024-07-15',
      isCurrent: false,
      location: 'Trivandrum, Kerala',
      summary: 'Worked on developing responsive web applications using HTML, CSS, JavaScript and Django.',
      skills: ['HTML', 'CSS', 'JavaScript', 'Django', 'Git']
    }
  ],
  documents: {
    profilePhoto: { name: 'Profile-Photo.jpg', size: '215 KB', status: 'Uploaded', type: 'JPG/PNG' },
    resume: { name: 'Resume.pdf', size: '1.5 MB', status: 'Uploaded', type: 'PDF' },
    class10Cert: { name: 'Class-X-Certificate.pdf', size: '1.2 MB', status: 'Uploaded', type: 'PDF' },
    class12Cert: { name: 'Class-XII-Certificate.pdf', size: '1.4 MB', status: 'Uploaded', type: 'PDF' },
    degreeMarksheet: { name: 'Degree Marksheet', size: 'Fetch from DigiLocker', status: 'Fetched', type: 'DigiLocker' }
  }
};
