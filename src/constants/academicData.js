/**
 * Academic constants and validation utilities for student registration.
 * Provides dynamic admission years, authoritative institution options,
 * program-aligned specializations, and strict field validators.
 */

export const VERIFIED_COLLEGES = [
  'Amal Jyothi College of Engineering, Kottayam',
  'Christ University, Bengaluru',
  'Christ College (Autonomous), Irinjalakuda',
  'Rajagiri College of Social Sciences, Kochi',
  'Saintgits College of Engineering, Kottayam',
  'Marian College Kuttikkanam, Idukki',
  'College of Engineering Trivandrum (CET)',
  'Government Engineering College, Thrissur',
  'TKM College of Engineering, Kollam',
  'National Institute of Technology Calicut (NITC)',
  'Indian Institute of Technology Palakkad (IIT Palakkad)',
  'Indian Institute of Technology Madras (IIT Madras)',
  'Indian Institute of Science (IISc), Bengaluru',
  'Cochin University of Science and Technology (CUSAT)',
  'Muthoot Institute of Technology and Science (MITS), Ernakulam',
  'Federal Institute of Science and Technology (FISAT), Angamaly',
  'Mar Athanasius College of Engineering, Kothamangalam',
  'SCMS School of Engineering and Technology, Ernakulam',
  'Model Engineering College, Thrikkakara',
  'Government College of Engineering, Kannur',
  'NSS College of Engineering, Palakkad',
  'Sree Chitra Thirunal College of Engineering, Thiruvananthapuram',
  'LBS Institute of Technology for Women, Thiruvananthapuram',
  'St. Joseph\'s University, Bengaluru',
  'Vellore Institute of Technology (VIT), Vellore',
  'Manipal Academy of Higher Education (MAHE), Manipal',
  'Birla Institute of Technology and Science (BITS), Pilani',
  'PSG College of Technology, Coimbatore',
  'Loyola College, Chennai',
  'Madras Christian College (MCC), Chennai',
  'University of Delhi (DU), New Delhi',
  'St. Stephen\'s College, Delhi',
  'Indian Institute of Technology Bombay (IIT Bombay)',
  'College of Engineering Pune (COEP)',
  'Symbiosis International University, Pune',
  'St. Xavier\'s College, Mumbai',
  'University of Mumbai, Mumbai'
];

export const INSTITUTION_ALIASES = {
  'christ': ['Christ University, Bengaluru', 'Christ College (Autonomous), Irinjalakuda'],
  'cet': ['College of Engineering Trivandrum (CET)'],
  'nitc': ['National Institute of Technology Calicut (NITC)'],
  'nit calicut': ['National Institute of Technology Calicut (NITC)'],
  'iit palakkad': ['Indian Institute of Technology Palakkad (IIT Palakkad)'],
  'iitpkd': ['Indian Institute of Technology Palakkad (IIT Palakkad)'],
  'iit madras': ['Indian Institute of Technology Madras (IIT Madras)'],
  'iitm': ['Indian Institute of Technology Madras (IIT Madras)'],
  'iit bombay': ['Indian Institute of Technology Bombay (IIT Bombay)'],
  'iisc': ['Indian Institute of Science (IISc), Bengaluru'],
  'gec thrissur': ['Government Engineering College, Thrissur'],
  'gect': ['Government Engineering College, Thrissur'],
  'tkm': ['TKM College of Engineering, Kollam'],
  'tkmce': ['TKM College of Engineering, Kollam'],
  'mits': ['Muthoot Institute of Technology and Science (MITS), Ernakulam'],
  'fisat': ['Federal Institute of Science and Technology (FISAT), Angamaly'],
  'mace': ['Mar Athanasius College of Engineering, Kothamangalam'],
  'mec': ['Model Engineering College, Thrikkakara'],
  'bits': ['Birla Institute of Technology and Science (BITS), Pilani'],
  'vit': ['Vellore Institute of Technology (VIT), Vellore'],
  'mahe': ['Manipal Academy of Higher Education (MAHE), Manipal'],
  'psg': ['PSG College of Technology, Coimbatore'],
  'du': ['University of Delhi (DU), New Delhi'],
  'coep': ['College of Engineering Pune (COEP)'],
  'ajce': ['Amal Jyothi College of Engineering, Kottayam']
};

/**
 * Generates admission year options dynamically from 2021 up to the current calendar year.
 * Always includes the current year and preserves any saved year from existing profiles.
 */
export const getAdmissionYearOptions = (savedYear = null, targetCurrentYear = null) => {
  const currentYear = targetCurrentYear || new Date().getFullYear();
  const startYear = 2021;
  const years = [];

  const minYear = savedYear && !isNaN(Number(savedYear)) && Number(savedYear) < startYear
    ? Number(savedYear)
    : startYear;
  const maxYear = savedYear && !isNaN(Number(savedYear)) && Number(savedYear) > currentYear
    ? Number(savedYear)
    : currentYear;

  for (let y = minYear; y <= maxYear; y++) {
    years.push(String(y));
  }
  return years;
};

/**
 * Validates that an admission year is within the permitted range [2021, currentYear]
 * or matches a legitimate previously saved profile year.
 */
export const isValidAdmissionYear = (year, savedYear = null, targetCurrentYear = null) => {
  if (!year) return false;
  const yearStr = String(year).trim();
  if (savedYear && String(savedYear).trim() === yearStr) return true;

  const num = Number(yearStr);
  if (isNaN(num)) return false;
  const currentYear = targetCurrentYear || new Date().getFullYear();
  return num >= 2021 && num <= currentYear;
};

/**
 * Searches verified colleges by query, supporting case-insensitive partial match
 * and alias lookup (e.g. CET, NITC, Christ).
 */
export const searchVerifiedColleges = (query) => {
  const searchLower = (query || '').trim().toLowerCase();
  if (!searchLower) {
    return VERIFIED_COLLEGES.slice(0, 10).map((name) => ({ name }));
  }

  const matchedFromAliases = [];
  for (const [aliasKey, targetList] of Object.entries(INSTITUTION_ALIASES)) {
    if (searchLower === aliasKey || searchLower.includes(aliasKey) || aliasKey.includes(searchLower)) {
      matchedFromAliases.push(...targetList);
    }
  }

  const localMatches = VERIFIED_COLLEGES.filter((c) => c.toLowerCase().includes(searchLower));

  const combined = Array.from(new Set([...matchedFromAliases, ...localMatches]));
  return combined.map((name) => ({ name }));
};

/**
 * Verified specializations mapped by course/program.
 */
export const COURSE_SPECIALIZATIONS_MAP = {
  // MCA / BCA / Computer Applications
  'MCA': [
    'Computer Applications',
    'Artificial Intelligence & Machine Learning',
    'Data Science',
    'Cyber Security',
    'Cloud Computing',
    'Software Engineering',
    'Full Stack Web Development',
    'UI/UX Design',
    'Others'
  ],
  'MCA (Integrated)': [
    'Computer Applications',
    'Artificial Intelligence & Machine Learning',
    'Data Science',
    'Cyber Security',
    'Cloud Computing',
    'Software Engineering',
    'Others'
  ],
  'MCA (Lateral Entry)': [
    'Computer Applications',
    'Artificial Intelligence',
    'Data Science',
    'Cyber Security',
    'Software Engineering',
    'Others'
  ],
  'MCA + MBA (Integrated)': [
    'Information Technology Management',
    'Business Analytics & Systems',
    'Software Project Management',
    'Enterprise Applications',
    'Others'
  ],
  'BCA': [
    'Computer Applications',
    'Software Development',
    'Web Technologies',
    'Cloud Computing',
    'Data Analytics',
    'Artificial Intelligence',
    'Others'
  ],
  'BCA + MCA (Integrated)': [
    'Computer Applications',
    'Artificial Intelligence',
    'Data Science',
    'Cyber Security',
    'Cloud Computing',
    'Software Engineering',
    'Others'
  ],

  // B.Tech / M.Tech Computer Science & IT
  'B.Tech Computer Science': [
    'Computer Science & Engineering',
    'Artificial Intelligence & Machine Learning',
    'Data Science',
    'Cyber Security',
    'Cloud Computing & DevOps',
    'Internet of Things (IoT)',
    'Software Engineering',
    'Others'
  ],
  'B.Tech Information Technology': [
    'Information Technology',
    'Cloud Computing',
    'Cyber Security & Digital Forensics',
    'Full Stack Web Development',
    'Data Science',
    'Others'
  ],
  'B.Tech Artificial Intelligence': [
    'Artificial Intelligence',
    'Machine Learning & Deep Learning',
    'Natural Language Processing',
    'Computer Vision & Robotics',
    'Others'
  ],
  'B.Tech Artificial Intelligence & Data Science': [
    'Artificial Intelligence & Data Science',
    'Machine Learning & Big Data Analytics',
    'Business Intelligence',
    'Deep Learning',
    'Others'
  ],
  'B.Tech Data Science': [
    'Data Science & Analytics',
    'Big Data Technologies',
    'Machine Learning',
    'Statistical Modeling',
    'Others'
  ],
  'B.Tech Cyber Security': [
    'Cyber Security',
    'Information Security & Digital Forensics',
    'Network Security & Cryptography',
    'Ethical Hacking & Threat Analysis',
    'Others'
  ],
  'M.Tech Computer Science': [
    'Computer Science & Engineering',
    'Artificial Intelligence',
    'Data Analytics',
    'Cyber Security',
    'High Performance Computing',
    'Others'
  ],
  'M.Tech Artificial Intelligence': [
    'Artificial Intelligence',
    'Deep Learning & Cognitive Computing',
    'Robotics & Autonomous Systems',
    'Computer Vision',
    'Others'
  ],
  'M.Tech': [
    'Computer Science',
    'Artificial Intelligence',
    'VLSI & Embedded Systems',
    'Structural Engineering',
    'Thermal Engineering',
    'Power Systems',
    'Others'
  ],
  'M.Tech + MCA (Integrated)': [
    'Computer Science & Applications',
    'Artificial Intelligence',
    'Software Systems',
    'Others'
  ],
  'MCA + M.Tech (Integrated)': [
    'Computer Science & Applications',
    'Artificial Intelligence',
    'Software Systems',
    'Others'
  ],

  // Electronics & Electrical Engineering
  'B.Tech Electronics & Communication': [
    'Electronics & Communication Engineering',
    'VLSI & Embedded Systems',
    'Signal Processing & Telecommunication',
    'Robotics & Automation',
    'IoT & Sensor Technologies',
    'Others'
  ],
  'B.Tech Electronics & Comm': [
    'Electronics & Communication Engineering',
    'VLSI & Embedded Systems',
    'Signal Processing & Telecommunication',
    'Robotics & Automation',
    'IoT & Sensor Technologies',
    'Others'
  ],
  'B.Tech Electrical & Electronics': [
    'Electrical & Electronics Engineering',
    'Power Systems & Renewable Energy',
    'Control Systems & Automation',
    'Electric Vehicle Technology',
    'Industrial Drives & Power Electronics',
    'Others'
  ],
  'B.Tech Electrical Engineering': [
    'Electrical Engineering',
    'Power Systems & Grid Technologies',
    'Control & Automation',
    'Renewable Energy Systems',
    'Others'
  ],

  // Mechanical & Civil Engineering
  'B.Tech Mechanical Engineering': [
    'Mechanical Engineering',
    'Thermal Engineering',
    'Machine Design & CAD/CAM',
    'Robotics & Mechatronics',
    'Manufacturing & Industrial Engineering',
    'Others'
  ],
  'B.Tech Mechanical': [
    'Mechanical Engineering',
    'Thermal Engineering',
    'Machine Design & CAD/CAM',
    'Robotics & Mechatronics',
    'Manufacturing & Industrial Engineering',
    'Others'
  ],
  'B.Tech Civil Engineering': [
    'Civil Engineering',
    'Structural Engineering',
    'Geotechnical & Transportation Engineering',
    'Environmental Engineering & Water Resources',
    'Construction Management & Technology',
    'Others'
  ],

  // Management
  'MBA': [
    'Finance',
    'Marketing Management',
    'Human Resource Management (HR)',
    'Operations & Supply Chain Management',
    'Business Analytics & Systems',
    'International Business',
    'Others'
  ],
  'PGDM + MCA (Integrated)': [
    'Information Technology Management',
    'Business Analytics & Enterprise Systems',
    'Software Project Management',
    'Others'
  ]
};

const DEFAULT_SPECIALIZATIONS = [
  'Computer Applications',
  'Artificial Intelligence',
  'Cyber Security',
  'Data Science',
  'Machine Learning',
  'Software Engineering',
  'Others'
];

/**
 * Retrieves the verified specialization options for a selected course.
 */
export const getSpecializationsForCourse = (course) => {
  if (!course || typeof course !== 'string') return DEFAULT_SPECIALIZATIONS;
  const match = COURSE_SPECIALIZATIONS_MAP[course.trim()];
  if (match) return match;

  // Partial course name lookup
  const clean = course.trim().toLowerCase();
  for (const [key, list] of Object.entries(COURSE_SPECIALIZATIONS_MAP)) {
    if (clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
      return list;
    }
  }
  return DEFAULT_SPECIALIZATIONS;
};

/**
 * Validates a custom specialization entered under the "Others" option.
 * Rejects empty values, meaningless repeated characters (e.g., 'ffffffffffff'),
 * invalid special characters, and length violations.
 */
export const validateCustomSpecialization = (value) => {
  if (!value || typeof value !== 'string') {
    return { isValid: false, message: 'Please enter your specialization.' };
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { isValid: false, message: 'Please enter your specialization.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Specialization name is too short (minimum 2 characters).' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, message: 'Specialization name is too long (maximum 100 characters).' };
  }

  // Allowed characters: letters, numbers, spaces, hyphens, ampersands, slashes, parentheses, commas, periods
  const validCharRegex = /^[a-zA-Z0-9\s\-&/(),.'"]+$/;
  if (!validCharRegex.test(trimmed)) {
    return { isValid: false, message: 'Specialization contains invalid characters. Use letters, numbers, and standard academic punctuation.' };
  }

  // Must contain meaningful letters (at least 2 alphabetic characters)
  const letterMatches = trimmed.match(/[a-zA-Z]/g);
  if (!letterMatches || letterMatches.length < 2) {
    return { isValid: false, message: 'Specialization must contain meaningful letters.' };
  }

  // Reject strings made entirely of repeated characters (e.g. 'ffffffffffff', 'aaaaa', '1111')
  const alphaNumeric = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
  const uniqueChars = new Set(alphaNumeric);
  if (uniqueChars.size <= 1) {
    return { isValid: false, message: 'Please enter a meaningful specialization, not repeated characters.' };
  }

  // Reject runs of 5 or more identical consecutive characters
  if (/(.)\1{4,}/i.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid specialization without excessive repeated characters.' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validates a custom institution name entered when "Other institution / Not listed" is chosen.
 */
export const validateCustomInstitution = (value) => {
  if (!value || typeof value !== 'string') {
    return { isValid: false, message: 'Please enter your institution name.' };
  }
  const trimmed = value.trim();
  if (trimmed.length < 3) {
    return { isValid: false, message: 'Institution name must be at least 3 characters.' };
  }
  if (trimmed.length > 200) {
    return { isValid: false, message: 'Institution name cannot exceed 200 characters.' };
  }
  const validCharRegex = /^[a-zA-Z0-9\s\-&/(),.'"]+$/;
  if (!validCharRegex.test(trimmed)) {
    return { isValid: false, message: 'Institution name contains invalid characters.' };
  }
  const letterMatches = trimmed.match(/[a-zA-Z]/g);
  if (!letterMatches || letterMatches.length < 3) {
    return { isValid: false, message: 'Institution name must contain meaningful letters.' };
  }
  const alphaNumeric = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (new Set(alphaNumeric).size <= 1) {
    return { isValid: false, message: 'Please enter a valid institution name, not repeated characters.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validates mobile numbers according to country format.
 * For India (+91):
 * - Exactly 10 digits beginning with 6, 7, 8, or 9
 * - Rejects 0000000000, 1111111111, all repeated digits, letters, symbols
 */
export const validateMobileNumber = (phone, country = 'India') => {
  if (phone === undefined || phone === null) {
    return { isValid: false, message: 'Enter a valid 10-digit Indian mobile number.' };
  }

  const raw = String(phone).trim();
  if (!raw) {
    return { isValid: false, message: 'Enter a valid 10-digit Indian mobile number.' };
  }

  const countryClean = (country || 'India').trim().toLowerCase();
  const isIndia = ['india', '+91', '91', 'in'].includes(countryClean);

  if (isIndia) {
    // Strip optional +91, leading 91 (if 12 digits), or leading 0 (if 11 digits)
    let cleaned = raw.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+91')) {
      cleaned = cleaned.slice(3);
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = cleaned.slice(2);
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = cleaned.slice(1);
    }

    // Must be numeric only
    if (!/^\d+$/.test(cleaned)) {
      return { isValid: false, message: 'Enter a valid 10-digit Indian mobile number.' };
    }

    // Must be exactly 10 digits
    if (cleaned.length !== 10) {
      return { isValid: false, message: 'Enter a valid 10-digit Indian mobile number.' };
    }

    // Must start with 6, 7, 8, or 9
    if (!/^[6-9]/.test(cleaned)) {
      return { isValid: false, message: 'Enter a valid 10-digit Indian mobile number.' };
    }

    // Reject obvious placeholders consisting entirely of repeated digits (0000000000, 1111111111, 9999999999)
    if (new Set(cleaned).size <= 1) {
      return { isValid: false, message: 'Enter a valid 10-digit Indian mobile number.' };
    }

    return { isValid: true, message: '', normalized: cleaned };
  } else {
    // International numbers
    const cleanedDigits = raw.replace(/\D/g, '');
    if (cleanedDigits.length < 7 || cleanedDigits.length > 15 || new Set(cleanedDigits).size <= 1) {
      return { isValid: false, message: 'Enter a valid mobile number.' };
    }
    return { isValid: true, message: '', normalized: cleanedDigits };
  }
};

/**
 * Validates email addresses:
 * - Trims surrounding whitespace
 * - Requires lowercase characters
 * - Supports subdomains (e.g. abhinandkk2027@mca.ajce.in)
 */
export const validateEmail = (email) => {
  const errMessage = 'Please enter a valid lowercase email address.';
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: errMessage };
  }

  const trimmed = email.trim();
  if (trimmed.length === 0 || /\s/.test(trimmed)) {
    return { isValid: false, message: errMessage };
  }

  // Reject uppercase characters
  if (/[A-Z]/.test(trimmed)) {
    return { isValid: false, message: errMessage };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: errMessage };
  }

  const [username, domain] = parts;
  if (!username || username.length < 1 || username.startsWith('.') || username.endsWith('.')) {
    return { isValid: false, message: errMessage };
  }
  if (username.includes('..')) {
    return { isValid: false, message: errMessage };
  }

  const usernameRegex = /^[a-z0-9]+([._+-][a-z0-9]+)*$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: errMessage };
  }

  if (!domain || domain.length < 3 || domain.startsWith('.') || domain.endsWith('.')) {
    return { isValid: false, message: errMessage };
  }
  if (domain.includes('..')) {
    return { isValid: false, message: errMessage };
  }

  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return { isValid: false, message: errMessage };
  }

  return { isValid: true, message: '', normalized: trimmed };
};

/**
 * Validates first name / last name:
 * - Trims whitespace
 * - Minimum 2 characters
 * - Only letters, spaces, hyphens, and apostrophes
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'Name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters.' };
  }
  if (!/^[A-Za-z\s'-]+$/.test(trimmed)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, or apostrophes.' };
  }
  return { isValid: true, message: '', normalized: trimmed };
};

