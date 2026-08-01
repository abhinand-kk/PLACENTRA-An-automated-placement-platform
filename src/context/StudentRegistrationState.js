export const initialStudentRegistrationState = {
  basicDetails: {
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    gender: '',
    bloodGroup: '',
    college: '',
    course: '',
    branch: '',
    rollNumber: '',
    currentSemester: '',
    admissionYear: '',
    primaryEmail: '',
    mobileNumber: ''
  },
  contactVerification: {
    primaryEmailVerified: false,
    personalEmail: '',
    personalEmailVerified: false,
    mobileVerified: false,
    address: {
      country: 'India',
      pincode: '',
      state: '',
      district: '',
      city: '',
      addressLine: ''
    },
    sameAsPermanent: false
  },
  currentEducation: {
    status: 'pursuing', // 'pursuing' | 'completed'
    fieldOfStudy: '',
    program: '',
    major: '',
    startDate: '',
    expectedEndDate: '',
    batch: '',
    currentSemester: '',
    percentage: '',
    scoreType: '%',
    totalBacklogs: ''
  },
  previousEducation: {
    class12: {
      board: '',
      schoolName: '',
      yearOfPassing: '',
      percentage: '',
      maxMarks: '',
      obtainedMarks: '',
      subjects: []
    },
    class10: {
      board: '',
      schoolName: '',
      yearOfPassing: '',
      percentage: '',
      maxMarks: '',
      obtainedMarks: ''
    },
    additionalQualifications: []
  },
  experiences: [],
  documents: {
    profilePhoto: { name: '', size: '', status: 'Pending', type: 'JPG/PNG' },
    resume: { name: '', size: '', status: 'Pending', type: 'PDF' },
    class10Cert: { name: '', size: '', status: 'Pending', type: 'PDF' },
    class12Cert: { name: '', size: '', status: 'Pending', type: 'PDF' },
    degreeMarksheet: { name: '', size: 'Fetch from DigiLocker', status: 'Pending', type: 'DigiLocker' }
  }
};
