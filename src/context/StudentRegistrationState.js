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
    customBranch: '',
    rollNumber: '',
    currentSemester: '',
    admissionYear: '',
    primaryEmail: '',
    mobileNumber: ''
  },
  contactVerification: {
    primaryEmailVerified: false,
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
      qualType: '10+2',
      board: '',
      schoolName: '',
      yearOfPassing: '',
      percentage: '',
      subjects: []
    },
    class10: {
      board: '',
      schoolName: '',
      yearOfPassing: '',
      percentage: ''
    },
    additionalQualifications: []
  },
  experiences: [],
  documents: {
    profilePhoto: { name: '', size: '', status: 'Pending', type: 'JPG/PNG' },
    resume: { name: '', size: '', status: 'Pending', type: 'PDF' },
    class10Cert: { name: '', size: '', status: 'Pending', type: 'PDF' },
    class12Cert: { name: '', size: '', status: 'Pending', type: 'PDF' },
    degreeMarksheet: { name: '', size: '', status: 'Pending', type: 'PDF' }
  }
};
