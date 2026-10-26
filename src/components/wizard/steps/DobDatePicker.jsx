import React from 'react';
import DatePicker from '../../common/DatePicker';

/**
 * DobDatePicker
 * Standardized Date of Birth picker delegating to the unified DatePicker component.
 * Preserves existing component interface, 18+ requirement, and styling.
 */
export default function DobDatePicker({
  value,
  onChange,
  onBlur,
  invalid = false,
  required = false,
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      invalid={invalid}
      required={required}
      disabled={disabled}
      isDob={true}
      minAge={18}
      placeholder="dd-mm-yyyy"
      ariaLabel="Date of Birth input field"
      className={className}
      {...rest}
    />
  );
}
