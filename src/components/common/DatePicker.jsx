import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import './DatePicker.css';

import {
  MONTH_NAMES,
  WEEKDAY_NAMES,
  parseIsoDate,
  formatToIso,
  formatDisplayDate,
  calculateAge
} from '../../utils/dateUtils';

export {
  MONTH_NAMES,
  WEEKDAY_NAMES,
  parseIsoDate,
  formatToIso,
  formatDisplayDate,
  calculateAge
};

/**
 * Modern, accessible, reusable DatePicker component for PLACENTRA.
 * Matches modern UI specifications: clean white panel, rounded corners,
 * subtle shadow, purple focus outline, month/year selectors,
 * spacious grid, Clear, and Today actions.
 */
export default function DatePicker({
  value = '',
  onChange,
  onBlur,
  placeholder = 'dd-mm-yyyy',
  minDate = null,
  maxDate = null,
  isDob = false,
  minAge = 18,
  disabled = false,
  required = false,
  invalid = false,
  clearable = true,
  showToday = true,
  id,
  name,
  ariaLabel = 'Select date',
  className = '',
  style = {},
  isDateDisabled: customDateDisabled
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const popoverRef = useRef(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, placement: 'bottom' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse minDate and maxDate
  const resolvedMinDate = minDate === 'today'
    ? today
    : (typeof minDate === 'string' ? parseIsoDate(minDate) : minDate);

  let resolvedMaxDate = maxDate === 'today'
    ? today
    : (typeof maxDate === 'string' ? parseIsoDate(maxDate) : maxDate);

  if (isDob) {
    const maxDob = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    if (!resolvedMaxDate || resolvedMaxDate > maxDob) {
      resolvedMaxDate = maxDob;
    }
  }

  const selectedDateObj = parseIsoDate(value);

  const initialYear = selectedDateObj
    ? selectedDateObj.getFullYear()
    : (resolvedMaxDate ? resolvedMaxDate.getFullYear() : today.getFullYear());

  const initialMonth = selectedDateObj
    ? selectedDateObj.getMonth()
    : (resolvedMaxDate ? resolvedMaxDate.getMonth() : today.getMonth());

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Keep calendar view synced with selected value
  useEffect(() => {
    if (selectedDateObj) {
      setViewYear(selectedDateObj.getFullYear());
      setViewMonth(selectedDateObj.getMonth());
    }
  }, [value]);

  // Calculate popover positioning using getBoundingClientRect
  const updatePosition = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const popoverHeight = 350;
    const popoverWidth = 310;
    const padding = 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const showAbove = spaceBelow < popoverHeight && spaceAbove > popoverHeight;

    const top = showAbove
      ? rect.top + window.scrollY - popoverHeight - 6
      : rect.bottom + window.scrollY + 6;

    let left = rect.left + window.scrollX;
    if (left + popoverWidth > window.innerWidth - padding) {
      left = Math.max(padding, window.innerWidth - popoverWidth - padding);
    }
    if (left < padding) {
      left = padding;
    }

    setPopoverPos({
      top,
      left,
      placement: showAbove ? 'top' : 'bottom'
    });
  }, []);

  // Recalculate position on open, scroll, or resize
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScroll = (e) => {
        // If scrolling inside popover itself, do not close or reposition
        if (popoverRef.current && popoverRef.current.contains(e.target)) return;
        updatePosition();
      };
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inWrapper = wrapperRef.current && wrapperRef.current.contains(event.target);
      const inPopover = popoverRef.current && popoverRef.current.contains(event.target);
      if (!inWrapper && !inPopover) {
        if (isOpen) {
          setIsOpen(false);
          if (onBlur) onBlur();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onBlur]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
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

  const isCellDisabled = (y, m, d) => {
    const dateObj = new Date(y, m, d);
    dateObj.setHours(0, 0, 0, 0);

    if (resolvedMinDate && dateObj < resolvedMinDate) return true;
    if (resolvedMaxDate && dateObj > resolvedMaxDate) return true;

    if (isDob) {
      if (dateObj > today) return true;
      const cY = today.getFullYear();
      const cM = today.getMonth();
      const cD = today.getDate();
      let age = cY - y;
      if (cM < m || (cM === m && cD < d)) age--;
      if (age < minAge) return true;
    }

    if (typeof customDateDisabled === 'function') {
      return customDateDisabled(dateObj);
    }

    return false;
  };

  const handleSelectDate = (e, y, m, d) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCellDisabled(y, m, d)) return;

    const formattedIso = formatToIso(y, m, d);
    if (onChange) onChange(formattedIso);
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onChange) onChange('');
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  const isTodayDisabled = isCellDisabled(today.getFullYear(), today.getMonth(), today.getDate());

  const handleToday = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTodayDisabled) return;
    const formattedIso = formatToIso(today.getFullYear(), today.getMonth(), today.getDate());
    if (onChange) onChange(formattedIso);
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  // Generate Year Options
  const currentYear = today.getFullYear();
  const minYearLimit = resolvedMinDate
    ? resolvedMinDate.getFullYear()
    : (isDob ? 1940 : currentYear - 50);
  const maxYearLimit = resolvedMaxDate
    ? resolvedMaxDate.getFullYear()
    : currentYear + 15;

  const startYear = Math.min(minYearLimit, viewYear);
  const endYear = Math.max(maxYearLimit, viewYear);

  const yearOptions = [];
  if (isDob) {
    for (let y = endYear; y >= startYear; y--) {
      yearOptions.push(y);
    }
  } else {
    for (let y = startYear; y <= endYear; y++) {
      yearOptions.push(y);
    }
  }

  // Generate 42 calendar cells (7 columns x 6 rows)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYearNum = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarCells.push({
      day: dayNum,
      month: prevMonthIdx,
      year: prevYearNum,
      isMuted: true,
      isDisabled: isCellDisabled(prevYearNum, prevMonthIdx, dayNum)
    });
  }

  // Current month days
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
      isDisabled: isCellDisabled(viewYear, viewMonth, d)
    });
  }

  // Next month leading days to complete 42 cells
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYearNum = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarCells.push({
      day: d,
      month: nextMonthIdx,
      year: nextYearNum,
      isMuted: true,
      isDisabled: isCellDisabled(nextYearNum, nextMonthIdx, d)
    });
  }

  const calendarPopover = isOpen && (
    <div
      ref={popoverRef}
      className={`modern-datepicker-popover popover-${popoverPos.placement}`}
      role="dialog"
      aria-label="Date Picker Calendar"
      style={{
        position: 'absolute',
        top: `${popoverPos.top}px`,
        left: `${popoverPos.left}px`,
        zIndex: 999999
      }}
    >
      {/* Header with Nav Arrows and Selectors */}
      <div className="mdp-header">
        <button
          type="button"
          className="mdp-nav-btn"
          onClick={handlePrevMonth}
          aria-label="Previous Month"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="mdp-selectors-group">
          <select
            className="mdp-select mdp-select-month"
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            aria-label="Select Month"
          >
            {MONTH_NAMES.map((mName, idx) => (
              <option key={mName} value={idx}>{mName}</option>
            ))}
          </select>

          <select
            className="mdp-select mdp-select-year"
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
          className="mdp-nav-btn"
          onClick={handleNextMonth}
          aria-label="Next Month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday Row (Sunday to Saturday) */}
      <div className="mdp-weekdays-grid">
        {WEEKDAY_NAMES.map(dayName => (
          <div key={dayName} className="mdp-weekday-cell">
            {dayName}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="mdp-days-grid">
        {calendarCells.map((cell, idx) => {
          const classes = [
            'mdp-day-btn',
            cell.isMuted ? 'muted' : '',
            cell.isSelected ? 'selected' : '',
            cell.isToday ? 'today' : '',
            cell.isDisabled ? 'disabled' : ''
          ].filter(Boolean).join(' ');

          return (
            <button
              key={idx}
              type="button"
              className={classes}
              disabled={cell.isDisabled}
              onClick={(e) => handleSelectDate(e, cell.year, cell.month, cell.day)}
              aria-label={`${cell.day} ${MONTH_NAMES[cell.month]} ${cell.year}`}
              aria-pressed={cell.isSelected}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Footer with Clear & Today */}
      <div className="mdp-footer">
        {clearable ? (
          <button
            type="button"
            className="mdp-footer-btn mdp-btn-clear"
            onClick={handleClear}
          >
            Clear
          </button>
        ) : <div />}

        {showToday && (
          <button
            type="button"
            className={`mdp-footer-btn mdp-btn-today ${isTodayDisabled ? 'disabled' : ''}`}
            onClick={handleToday}
            disabled={isTodayDisabled}
            title={isTodayDisabled ? 'Today is outside the allowed date range' : 'Select Today'}
          >
            Today
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`modern-datepicker-container ${className}`}
      ref={wrapperRef}
      style={style}
    >
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`modern-datepicker-input ${invalid ? 'invalid' : ''} ${isOpen ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={`mdp-input-value ${!value ? 'placeholder' : ''}`}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar size={18} className={`mdp-calendar-icon ${isOpen ? 'active' : ''}`} />
      </div>

      {/* Hidden input for standard form compliance if name is provided */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
        />
      )}

      {/* Portal popover to document.body to prevent clipping in scrollable containers and modals */}
      {typeof document !== 'undefined' && createPortal(calendarPopover, document.body)}
    </div>
  );
}
