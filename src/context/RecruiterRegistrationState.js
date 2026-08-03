export const initialRecruiterRegistrationState = {
  basicCompanyDetails: {
    companyName: '',
    recruiterFullName: '',
    designation: '',
    workEmail: '',
    mobileNumber: '',
    hiringVolume: ''
  },
  hiringPreferences: {
    targetRoles: ['Software Engineer', 'Full Stack Developer'],
    hiringType: 'Full-Time',
    eligibleCourses: ['B.Tech', 'MCA'],
    eligibleBranches: ['Computer Science', 'Artificial Intelligence'],
    minCgpa: '7.5',
    maxBacklogs: '0',
    expectedHiringMonth: '2026-09',
    expectedStudents: '15',
    packageOffered: '8.5',
    workMode: 'On-site',
    campusVisit: 'Yes',
    additionalRequirements: 'Candidates should have strong problem-solving skills and knowledge of data structures.'
  }
};
