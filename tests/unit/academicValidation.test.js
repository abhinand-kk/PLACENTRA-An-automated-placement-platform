import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateMobileNumber,
  getAdmissionYearOptions,
  isValidAdmissionYear,
  validateCustomSpecialization,
  getSpecializationsForCourse,
  searchVerifiedColleges,
  validateCustomInstitution,
  validateEmail,
  validateName,
} from '../../src/constants/academicData.js';

// -------------------------------------------------------------
// 1. Mobile Number Validation Tests
// -------------------------------------------------------------
test('Mobile Number Validation - India (+91)', async (t) => {
  await t.test('accepts valid 10-digit Indian numbers starting with 6, 7, 8, 9', () => {
    assert.equal(validateMobileNumber('9876543210', 'India').isValid, true);
    assert.equal(validateMobileNumber('8123456789', 'India').isValid, true);
    assert.equal(validateMobileNumber('7012345678', 'India').isValid, true);
    assert.equal(validateMobileNumber('6235407730', 'India').isValid, true);
  });

  await t.test('trims whitespace and normalizes prefixes (+91 and 0)', () => {
    const res1 = validateMobileNumber('  9876543210  ', 'India');
    assert.equal(res1.isValid, true);
    assert.equal(res1.normalized, '9876543210');

    const res2 = validateMobileNumber('+91 9876543210', 'India');
    assert.equal(res2.isValid, true);
    assert.equal(res2.normalized, '9876543210');

    const res3 = validateMobileNumber('09876543210', 'India');
    assert.equal(res3.isValid, true);
    assert.equal(res3.normalized, '9876543210');
  });

  await t.test('rejects 0000000000 and displays exact error message', () => {
    const res = validateMobileNumber('0000000000', 'India');
    assert.equal(res.isValid, false);
    assert.equal(res.message, 'Enter a valid 10-digit Indian mobile number.');
  });

  await t.test('rejects repeated digits like 1111111111, 8888888888, 9999999999', () => {
    ['1111111111', '2222222222', '3333333333', '8888888888', '9999999999'].forEach((num) => {
      const res = validateMobileNumber(num, 'India');
      assert.equal(res.isValid, false, `Expected ${num} to be invalid`);
      assert.equal(res.message, 'Enter a valid 10-digit Indian mobile number.');
    });
  });

  await t.test('rejects numbers starting with digits below 6 (e.g. 5, 4, 3, 2, 1)', () => {
    ['5555512345', '1234567890', '4876543210'].forEach((num) => {
      const res = validateMobileNumber(num, 'India');
      assert.equal(res.isValid, false, `Expected ${num} to be invalid`);
    });
  });

  await t.test('rejects letters, special characters, and wrong digit counts', () => {
    ['98765abcde', '98765-4321', '987654321', '98765432101', 'abcdefghij'].forEach((input) => {
      const res = validateMobileNumber(input, 'India');
      assert.equal(res.isValid, false, `Expected ${input} to be invalid`);
    });
  });

  await t.test('validates international numbers when country is not India', () => {
    assert.equal(validateMobileNumber('+14155552671', 'United States').isValid, true);
    assert.equal(validateMobileNumber('447911123456', 'United Kingdom').isValid, true);
    assert.equal(validateMobileNumber('123', 'United States').isValid, false); // too short
  });
});

// -------------------------------------------------------------
// 2. Dynamic Admission Year Tests
// -------------------------------------------------------------
test('Dynamic Admission Year Generation', async (t) => {
  await t.test('generates dynamic options up to the specified or current year', () => {
    const years2026 = getAdmissionYearOptions(null, 2026);
    assert.deepEqual(years2026, ['2021', '2022', '2023', '2024', '2025', '2026']);
    assert.equal(years2026.includes('2026'), true);
  });

  await t.test('dynamically advances when calendar year rolls over to 2027', () => {
    const years2027 = getAdmissionYearOptions(null, 2027);
    assert.deepEqual(years2027, ['2021', '2022', '2023', '2024', '2025', '2026', '2027']);
    assert.equal(years2027.includes('2027'), true);
  });

  await t.test('isValidAdmissionYear validates range correctly', () => {
    assert.equal(isValidAdmissionYear('2021', null, 2026), true);
    assert.equal(isValidAdmissionYear('2024', null, 2026), true);
    assert.equal(isValidAdmissionYear('2026', null, 2026), true);
    assert.equal(isValidAdmissionYear('2020', null, 2026), false);
    assert.equal(isValidAdmissionYear('2027', null, 2026), false);
    assert.equal(isValidAdmissionYear('invalid', null, 2026), false);
  });

  await t.test('preserves legitimate previously saved admission year outside range', () => {
    assert.equal(isValidAdmissionYear('2019', '2019', 2026), true);
    const optionsWithSaved = getAdmissionYearOptions('2019', 2026);
    assert.equal(optionsWithSaved.includes('2019'), true);
    assert.equal(optionsWithSaved[0], '2019');
  });

  await t.test('default getAdmissionYearOptions() includes the current calendar year', () => {
    const currentYear = new Date().getFullYear();
    const defaultYears = getAdmissionYearOptions();
    assert.equal(defaultYears.includes(String(currentYear)), true);
    assert.equal(defaultYears[0], '2021');
  });
});

// -------------------------------------------------------------
// 3. Branch / Specialization Validation Tests
// -------------------------------------------------------------
test('Branch / Specialization Validation', async (t) => {
  await t.test('provides curated specializations for programs', () => {
    const mcaSpecs = getSpecializationsForCourse('MCA');
    assert.equal(mcaSpecs.includes('Computer Applications'), true);
    assert.equal(mcaSpecs.includes('Artificial Intelligence & Machine Learning'), true);
    assert.equal(mcaSpecs.includes('Others'), true);

    const btechSpecs = getSpecializationsForCourse('B.Tech Computer Science');
    assert.equal(btechSpecs.includes('Computer Science & Engineering'), true);
    assert.equal(btechSpecs.includes('Data Science'), true);
    assert.equal(btechSpecs.includes('Others'), true);
  });

  await t.test('rejects arbitrary nonsense text like ffffffffffff', () => {
    const res1 = validateCustomSpecialization('ffffffffffff');
    assert.equal(res1.isValid, false);
    assert.equal(res1.message.includes('meaningful'), true);

    const res2 = validateCustomSpecialization('aaaaaaaa');
    assert.equal(res2.isValid, false);

    const res3 = validateCustomSpecialization('1234567890');
    assert.equal(res3.isValid, false);
  });

  await t.test('rejects empty input or strings with fewer than 2 letters', () => {
    assert.equal(validateCustomSpecialization('').isValid, false);
    assert.equal(validateCustomSpecialization('   ').isValid, false);
    assert.equal(validateCustomSpecialization('A').isValid, false);
    assert.equal(validateCustomSpecialization('1 - 2').isValid, false);
  });

  await t.test('accepts legitimate specialization names with normal academic punctuation', () => {
    const validNames = [
      'Artificial Intelligence & Data Science',
      'VLSI & Embedded Systems',
      'Bio-Technology (Bioinformatics)',
      'Robotics & Automation',
      'Computer Applications / Software Engg.',
      'Cyber Security & Digital Forensics',
    ];

    validNames.forEach((spec) => {
      const res = validateCustomSpecialization(spec);
      assert.equal(res.isValid, true, `Expected "${spec}" to be valid: ${res.message}`);
    });
  });

  await t.test('rejects strings with invalid characters or excessive length', () => {
    assert.equal(validateCustomSpecialization('Computer <script>alert(1)</script>').isValid, false);
    assert.equal(validateCustomSpecialization('A'.repeat(85)).isValid, false);
  });
});

// -------------------------------------------------------------
// 4. College / University Search Tests
// -------------------------------------------------------------
test('College / University Search and Fallback', async (t) => {
  await t.test('returns Christ University and Christ College when searching for "Christ"', () => {
    const results = searchVerifiedColleges('Christ');
    assert.equal(results.length >= 2, true);
    const names = results.map((r) => r.name);
    assert.equal(names.some((n) => n.includes('Christ University')), true);
    assert.equal(names.some((n) => n.includes('Christ College')), true);
  });

  await t.test('is case-insensitive for search queries', () => {
    const lower = searchVerifiedColleges('christ');
    const upper = searchVerifiedColleges('CHRIST');
    const mixed = searchVerifiedColleges('ChRiSt');
    assert.equal(lower.length, upper.length);
    assert.equal(lower.length, mixed.length);
  });

  await t.test('matches common aliases (CET, NITC, AJCE)', () => {
    const cet = searchVerifiedColleges('CET');
    assert.equal(cet.some((c) => c.name.includes('College of Engineering Trivandrum')), true);

    const nitc = searchVerifiedColleges('NITC');
    assert.equal(nitc.some((c) => c.name.includes('National Institute of Technology Calicut')), true);

    const ajce = searchVerifiedColleges('AJCE');
    assert.equal(ajce.some((c) => c.name.includes('Amal Jyothi')), true);
  });

  await t.test('returns empty array when no college matches query', () => {
    const results = searchVerifiedColleges('NonExistentUniversityXYZ12345');
    assert.deepEqual(results, []);
  });

  await t.test('validates custom institution for "Other institution / Not listed"', () => {
    assert.equal(validateCustomInstitution('Oxford College of Engineering').isValid, true);
    assert.equal(validateCustomInstitution('St. Joseph University - Campus 1').isValid, true);
    assert.equal(validateCustomInstitution('ffffffffffff').isValid, false);
    assert.equal(validateCustomInstitution('   ').isValid, false);
    assert.equal(validateCustomInstitution('AB').isValid, false);
  });
});

// -------------------------------------------------------------
// 5. Additional Validation Inconsistencies Tests
// -------------------------------------------------------------
test('Additional Validation Inconsistencies (First Name & Email)', async (t) => {
  await t.test('First Name validation accepts legitimate names and rejects empty/invalid', () => {
    assert.equal(validateName('Abhinand').isValid, true);
    assert.equal(validateName('  Abhinand  ').isValid, true);
    assert.equal(validateName('Mary-Jane').isValid, true);
    assert.equal(validateName("O'Connor").isValid, true);

    assert.equal(validateName('').isValid, false);
    assert.equal(validateName('   ').isValid, false);
    assert.equal(validateName('A').isValid, false);
    assert.equal(validateName('Abhinand123').isValid, false);
  });

  await t.test('Email validation supports lowercase institutional emails with subdomains', () => {
    const res1 = validateEmail('abhinandkk2027@mca.ajce.in');
    assert.equal(res1.isValid, true, `Expected abhinandkk2027@mca.ajce.in to be valid: ${res1.message}`);

    const res2 = validateEmail('student.name@dept.college.edu.in');
    assert.equal(res2.isValid, true);

    const res3 = validateEmail('user@domain.com');
    assert.equal(res3.isValid, true);
  });

  await t.test('Email validation rejects uppercase characters and displays lowercase warning', () => {
    const res = validateEmail('Abhinand@mca.ajce.in');
    assert.equal(res.isValid, false);
    assert.equal(res.message, 'Please enter a valid lowercase email address.');
  });

  await t.test('Email validation rejects malformed addresses', () => {
    ['notanemail', 'user@', '@domain.com', 'user@domain..com'].forEach((email) => {
      const res = validateEmail(email);
      assert.equal(res.isValid, false, `Expected ${email} to be invalid`);
    });
  });
});
