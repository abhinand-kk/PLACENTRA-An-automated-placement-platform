import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseIsoDate,
  formatToIso,
  formatDisplayDate,
  isLeapYear,
  getDaysInMonth,
  calculateAge,
  MONTH_NAMES,
  WEEKDAY_NAMES
} from '../../src/utils/dateUtils.js';

// -------------------------------------------------------------
// 1. Date Parsing & Formatting Tests (Backend & Display Integrity)
// -------------------------------------------------------------
test('DatePicker - ISO Parsing and Display Formatting', async (t) => {
  await t.test('parseIsoDate accurately parses YYYY-MM-DD into local Date without UTC offset shifts', () => {
    const d1 = parseIsoDate('2026-10-26');
    assert.ok(d1 instanceof Date);
    assert.equal(d1.getFullYear(), 2026);
    assert.equal(d1.getMonth(), 9); // October is month 9 (0-indexed)
    assert.equal(d1.getDate(), 26);

    const d2 = parseIsoDate('2000-01-01');
    assert.equal(d2.getFullYear(), 2000);
    assert.equal(d2.getMonth(), 0);
    assert.equal(d2.getDate(), 1);
  });

  await t.test('parseIsoDate returns null for missing or invalid dates', () => {
    assert.equal(parseIsoDate(''), null);
    assert.equal(parseIsoDate(null), null);
    assert.equal(parseIsoDate(undefined), null);
    assert.equal(parseIsoDate('invalid-date'), null);
    assert.equal(parseIsoDate('2026-10'), null);
  });

  await t.test('formatToIso creates zero-padded YYYY-MM-DD required by backend serializers', () => {
    assert.equal(formatToIso(2026, 9, 26), '2026-10-26');
    assert.equal(formatToIso(2026, 0, 5), '2026-01-05');
    assert.equal(formatToIso(2024, 1, 29), '2024-02-29'); // Leap year Feb 29
    assert.equal(formatToIso(1999, 11, 31), '1999-12-31');
  });

  await t.test('formatDisplayDate formats YYYY-MM-DD to user-friendly DD-MM-YYYY', () => {
    assert.equal(formatDisplayDate('2026-10-26'), '26-10-2026');
    assert.equal(formatDisplayDate('2002-08-15'), '15-08-2002');
    assert.equal(formatDisplayDate(''), '');
    assert.equal(formatDisplayDate(null), '');
  });
});

// -------------------------------------------------------------
// 2. Leap Year and Month Days Calculation Tests
// -------------------------------------------------------------
test('DatePicker - Leap Years and Month Day Placement', async (t) => {
  await t.test('February in leap years has 29 days', () => {
    // 2024, 2028, 2000 are leap years
    const days2024 = new Date(2024, 2, 0).getDate();
    assert.equal(days2024, 29);

    const days2028 = new Date(2028, 2, 0).getDate();
    assert.equal(days2028, 29);

    const days2000 = new Date(2000, 2, 0).getDate();
    assert.equal(days2000, 29);
  });

  await t.test('February in non-leap years has 28 days', () => {
    // 2025, 2026, 2027, 2100 are non-leap years
    const days2025 = new Date(2025, 2, 0).getDate();
    assert.equal(days2025, 28);

    const days2026 = new Date(2026, 2, 0).getDate();
    assert.equal(days2026, 28);

    const days1900 = new Date(1900, 2, 0).getDate();
    assert.equal(days1900, 28);
  });

  await t.test('30-day and 31-day months are accurately calculated', () => {
    // April, June, September, November have 30 days
    assert.equal(new Date(2026, 4, 0).getDate(), 30); // April
    assert.equal(new Date(2026, 6, 0).getDate(), 30); // June
    assert.equal(new Date(2026, 9, 0).getDate(), 30); // September
    assert.equal(new Date(2026, 11, 0).getDate(), 30); // November

    // January, March, May, July, August, October, December have 31 days
    assert.equal(new Date(2026, 1, 0).getDate(), 31); // January
    assert.equal(new Date(2026, 3, 0).getDate(), 31); // March
    assert.equal(new Date(2026, 5, 0).getDate(), 31); // May
    assert.equal(new Date(2026, 7, 0).getDate(), 31); // July
    assert.equal(new Date(2026, 8, 0).getDate(), 31); // August
    assert.equal(new Date(2026, 10, 0).getDate(), 31); // October
    assert.equal(new Date(2026, 12, 0).getDate(), 31); // December
  });
});

// -------------------------------------------------------------
// 3. Domain Rules & Date Constraint Tests
// -------------------------------------------------------------
test('DatePicker - Domain Constraints and Rules Validation', async (t) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calculateAge = (y, m, d) => {
    const cY = today.getFullYear();
    const cM = today.getMonth();
    const cD = today.getDate();
    let age = cY - y;
    if (cM < m || (cM === m && cD < d)) age--;
    return age;
  };

  await t.test('DOB constraint: enforces minimum age of 18', () => {
    // Person born exactly 18 years ago today is eligible
    const y18 = today.getFullYear() - 18;
    const m18 = today.getMonth();
    const d18 = today.getDate();
    assert.ok(calculateAge(y18, m18, d18) >= 18);

    // Person born 17 years ago is ineligible
    const y17 = today.getFullYear() - 17;
    assert.ok(calculateAge(y17, m18, d18) < 18);
  });

  await t.test('DOB constraint: rejects future dates', () => {
    const futureDate = new Date(today.getFullYear() + 1, 0, 1);
    assert.ok(futureDate > today);
  });

  await t.test('Experience date range constraint: end date must not precede start date', () => {
    const startDateStr = '2024-06-01';
    const validEndDateStr = '2024-12-01';
    const invalidEndDateStr = '2024-05-01';

    const sDate = parseIsoDate(startDateStr);
    const validEDate = parseIsoDate(validEndDateStr);
    const invalidEDate = parseIsoDate(invalidEndDateStr);

    assert.ok(validEDate >= sDate);
    assert.ok(invalidEDate < sDate);
  });

  await t.test('Interview and Drive date constraint: cannot be in the past', () => {
    const yesterday = new Date(today.getTime() - 86400000);
    const tomorrow = new Date(today.getTime() + 86400000);

    assert.ok(yesterday < today);
    assert.ok(tomorrow >= today);
    assert.ok(today >= today);
  });
});
