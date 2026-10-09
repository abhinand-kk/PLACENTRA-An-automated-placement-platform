import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import './DobDatePicker.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DobDatePicker({
  value,
  onChange,
  onBlur,
  invalid,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Maximum allowed birth date for 18+ requirement (18 years ago from today)
  const maxDobDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  const parseValueDate = (valStr) => {
    if (!valStr) return null;
    const parts = valStr.split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return new Date(y, m, d);
  };

  const selectedDateObj = parseValueDate(value);

  const [viewYear, setViewYear] = useState(() => {
    return selectedDateObj ? selectedDateObj.getFullYear() : maxDobDate.getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    return selectedDateObj ? selectedDateObj.getMonth() : maxDobDate.getMonth();
  });

  // Keep view aligned when value changes or when calendar opens
  useEffect(() => {
    if (selectedDateObj) {
      setViewYear(selectedDateObj.getFullYear());
      setViewMonth(selectedDateObj.getMonth());
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        if (isOpen) {
          setIsOpen(false);
          if (onBlur) onBlur();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onBlur]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onBlur]);

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const isDateDisabled = (y, m, d) => {
    const checkDate = new Date(y, m, d);
    if (checkDate > today) return true; // Future date
    
    // Calculate age
    const cY = today.getFullYear();
    const cM = today.getMonth();
    const cD = today.getDate();
    let age = cY - y;
    if (cM < m || (cM === m && cD < d)) {
      age--;
    }
    return age < 18;
  };

  const handleSelectDate = (e, y, m, d) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDateDisabled(y, m, d)) return;

    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const formattedIso = `${y}-${mm}-${dd}`;

    onChange(formattedIso);
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  const isTodayDisabled = isDateDisabled(today.getFullYear(), today.getMonth(), today.getDate());

  const handleToday = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTodayDisabled) return;
    const y = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    onChange(`${y}-${mm}-${dd}`);
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  const formatInputDisplay = (valStr) => {
    if (!valStr) return '';
    const parts = valStr.split('-');
    if (parts.length !== 3) return valStr;
    const [y, m, d] = parts;
    return `${d}-${m}-${y}`;
  };

  const currentYearNum = today.getFullYear();
  const yearOptions = [];
  for (let y = currentYearNum; y >= 1950; y--) {
    yearOptions.push(y);
  }

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarCells = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYearNum = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarCells.push({
      day: dayNum,
      month: prevMonthIdx,
      year: prevYearNum,
      isMuted: true,
      isDisabled: isDateDisabled(prevYearNum, prevMonthIdx, dayNum)
    });
  }

  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const isSelected = selectedDateObj &&
      selectedDateObj.getFullYear() === viewYear &&
      selectedDateObj.getMonth() === viewMonth &&
      selectedDateObj.getDate() === d;

    const isToday = today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === d;

    calendarCells.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isMuted: false,
      isSelected,
      isToday,
      isDisabled: isDateDisabled(viewYear, viewMonth, d)
    });
  }

  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYearNum = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarCells.push({
      day: d,
      month: nextMonthIdx,
      year: nextYearNum,
      isMuted: true,
      isDisabled: isDateDisabled(nextYearNum, nextMonthIdx, d)
    });
  }

  return (
    <div className="dob-datepicker-wrapper" ref={wrapperRef}>
      <div 
        className={`dob-input-field ${invalid ? 'invalid' : ''} ${isOpen ? 'focused' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Date of Birth input field"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={`dob-input-text ${!value ? 'placeholder' : ''}`}>
          {value ? formatInputDisplay(value) : 'dd-mm-yyyy'}
        </span>
        <Calendar size={18} className={`dob-input-icon ${isOpen ? 'active' : ''}`} />
      </div>

      {isOpen && (
        <div className="dob-calendar-popover" role="dialog" aria-label="Date of Birth Calendar">
          <div className="dob-cal-header">
            <button 
              type="button"
              className="dob-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="dob-header-title-group">
              <select 
                className="dob-month-select"
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                aria-label="Select Month"
              >
                {MONTH_NAMES.map((mName, idx) => (
                  <option key={mName} value={idx}>{mName}</option>
                ))}
              </select>

              <select 
                className="dob-year-select"
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                aria-label="Select Year"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button 
              type="button"
              className="dob-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="dob-weekdays-grid">
            {WEEKDAY_NAMES.map(dayName => (
              <div key={dayName} className="dob-weekday-header">
                {dayName}
              </div>
            ))}
          </div>

          <div className="dob-days-grid">
            {calendarCells.map((cell, idx) => {
              const cellClasses = [
                'dob-day-cell',
                cell.isMuted ? 'muted' : '',
                cell.isSelected ? 'selected' : '',
                cell.isToday ? 'today' : '',
                cell.isDisabled ? 'disabled' : ''
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={idx}
                  type="button"
                  className={cellClasses}
                  disabled={cell.isDisabled}
                  onClick={(e) => handleSelectDate(e, cell.year, cell.month, cell.day)}
                  title={cell.isDisabled ? 'Must be at least 18 years old and not in future' : undefined}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="dob-cal-footer">
            <button
              type="button"
              className="dob-action-btn dob-btn-clear"
              onClick={handleClear}
            >
              Clear
            </button>

            <button
              type="button"
              className={`dob-action-btn dob-btn-today ${isTodayDisabled ? 'disabled' : ''}`}
              onClick={handleToday}
              disabled={isTodayDisabled}
              title={isTodayDisabled ? 'Students must be at least 18 years old' : 'Select Today'}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
