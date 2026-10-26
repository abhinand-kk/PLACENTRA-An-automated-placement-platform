/**
 * Date utility helpers for PLACENTRA DatePicker and date domain validations.
 */

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Checks whether a given year is a leap year.
 */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

/**
 * Returns number of days in a given month (0-indexed month) and year.
 */
export const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

/**
 * Parses YYYY-MM-DD into a local Date object without UTC timezone shifts.
 */
export const parseIsoDate = (valStr) => {
  if (!valStr || typeof valStr !== 'string') return null;
  const parts = valStr.trim().split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m, d);
};

/**
 * Formats a Date components into YYYY-MM-DD.
 */
export const formatToIso = (y, m, d) => {
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
};

/**
 * Formats YYYY-MM-DD for visual display (DD-MM-YYYY).
 */
export const formatDisplayDate = (valStr) => {
  if (!valStr || typeof valStr !== 'string') return '';
  const parts = valStr.trim().split('-');
  if (parts.length !== 3) return valStr;
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
};

/**
 * Calculates accurate age based on birth date and reference date (defaults to today).
 */
export const calculateAge = (birthDateOrStr, refDate = new Date()) => {
  const bDate = typeof birthDateOrStr === 'string'
    ? parseIsoDate(birthDateOrStr)
    : birthDateOrStr;

  if (!bDate) return -1;

  const cY = refDate.getFullYear();
  const cM = refDate.getMonth();
  const cD = refDate.getDate();

  const y = bDate.getFullYear();
  const m = bDate.getMonth();
  const d = bDate.getDate();

  let age = cY - y;
  if (cM < m || (cM === m && cD < d)) {
    age--;
  }
  return age;
};
