import React, { useState } from 'react';
import { Building2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Step2OfficerInstitutionDetails({ state, onChange, onNext, onBack }) {
  const [touched, setTouched] = useState({});

  const data = state.institutionDetails || {};

  const handleChange = (field, value) => {
    onChange('institutionDetails', { ...data, [field]: value });
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation logic
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidMobile = (phone) => /^\d{10}$/.test(phone);
  const isValidPincode = (pin) => /^\d{6}$/.test(pin);

  const isCollegeNameValid = Boolean(data.collegeName?.trim());
  const isInstitutionTypeValid = Boolean(data.institutionType);
  const isAffiliatedUniversityValid = Boolean(data.affiliatedUniversity?.trim());
  const isStateValid = Boolean(data.stateName?.trim());
  const isDistrictValid = Boolean(data.districtName?.trim());
  const isAddressValid = Boolean(data.collegeAddress?.trim());
  const isPincodeValid = isValidPincode(data.pincode || '');
  const isPlacementEmailValid = isValidEmail(data.placementEmail || '');
  const isPlacementContactValid = isValidMobile(data.placementContactNumber || '');
  const isStudentsCountValid = Boolean(data.eligibleStudentsCount);

  const isFormValid =
    isCollegeNameValid &&
    isInstitutionTypeValid &&
    isAffiliatedUniversityValid &&
    isStateValid &&
    isDistrictValid &&
    isAddressValid &&
    isPincodeValid &&
    isPlacementEmailValid &&
    isPlacementContactValid &&
    isStudentsCountValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onChange('institutionDetails', data);
      if (onNext) {
        onNext();
      }
    }
  };

  const institutionTypeOptions = [
    'Engineering College',
    'Arts & Science College',
    'University',
    'Polytechnic',
    'Autonomous College',
    'Other'
  ];

  return (
    <div className="step-container">
      {/* Step Header */}
      <div className="step-header-wrap">
        <div className="step-icon-tile">
          <Building2 size={22} />
        </div>
        <div className="step-header-text">
          <h2>Institution Details</h2>
          <p>Provide your institution's placement information.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* College / University Name */}
        <div className="form-group" style={{ marginBottom: '22px' }}>
          <label className="form-label">College / University Name <span className="req">*</span></label>
          <div className="input-with-icon">
            <input 
              type="text"
              className={`form-control ${touched.collegeName && !isCollegeNameValid ? 'invalid' : ''}`}
              placeholder="e.g. Model Engineering College"
              value={data.collegeName}
              onChange={(e) => handleChange('collegeName', e.target.value)}
              onBlur={() => handleBlur('collegeName')}
              required
            />
            {isCollegeNameValid && (
              <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
            )}
          </div>
          {touched.collegeName && !isCollegeNameValid && (
            <span className="error-text">College / University name is required</span>
          )}
        </div>

        {/* Institution Type & Affiliated University */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Institution Type <span className="req">*</span></label>
            <select 
              className={`form-control ${touched.institutionType && !isInstitutionTypeValid ? 'invalid' : ''}`}
              value={data.institutionType}
              onChange={(e) => handleChange('institutionType', e.target.value)}
              onBlur={() => handleBlur('institutionType')}
              required
            >
              <option value="">Select Institution Type</option>
              {institutionTypeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {touched.institutionType && !isInstitutionTypeValid && (
              <span className="error-text">Institution type is required</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Affiliated University <span className="req">*</span></label>
            <input 
              type="text"
              className={`form-control ${touched.affiliatedUniversity && !isAffiliatedUniversityValid ? 'invalid' : ''}`}
              placeholder="e.g. APJ Abdul Kalam Technological University"
              value={data.affiliatedUniversity}
              onChange={(e) => handleChange('affiliatedUniversity', e.target.value)}
              onBlur={() => handleBlur('affiliatedUniversity')}
              required
            />
            {touched.affiliatedUniversity && !isAffiliatedUniversityValid && (
              <span className="error-text">Affiliated university is required</span>
            )}
          </div>
        </div>

        {/* State & District */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">State <span className="req">*</span></label>
            <input 
              type="text"
              className={`form-control ${touched.stateName && !isStateValid ? 'invalid' : ''}`}
              placeholder="e.g. Kerala"
              value={data.stateName}
              onChange={(e) => handleChange('stateName', e.target.value)}
              onBlur={() => handleBlur('stateName')}
              required
            />
            {touched.stateName && !isStateValid && (
              <span className="error-text">State is required</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">District <span className="req">*</span></label>
            <input 
              type="text"
              className={`form-control ${touched.districtName && !isDistrictValid ? 'invalid' : ''}`}
              placeholder="e.g. Ernakulam"
              value={data.districtName}
              onChange={(e) => handleChange('districtName', e.target.value)}
              onBlur={() => handleBlur('districtName')}
              required
            />
            {touched.districtName && !isDistrictValid && (
              <span className="error-text">District is required</span>
            )}
          </div>
        </div>

        {/* College Address & Pincode */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">College Address <span className="req">*</span></label>
            <textarea 
              className={`form-control ${touched.collegeAddress && !isAddressValid ? 'invalid' : ''}`}
              rows="3"
              placeholder="Thrikkakara, Kochi, Kerala"
              value={data.collegeAddress}
              onChange={(e) => handleChange('collegeAddress', e.target.value)}
              onBlur={() => handleBlur('collegeAddress')}
              required
            />
            {touched.collegeAddress && !isAddressValid && (
              <span className="error-text">College address is required</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Pincode <span className="req">*</span></label>
            <input 
              type="text"
              className={`form-control ${touched.pincode && !isPincodeValid ? 'invalid' : ''}`}
              placeholder="682021"
              value={data.pincode}
              onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              onBlur={() => handleBlur('pincode')}
              required
            />
            {touched.pincode && !isPincodeValid && (
              <span className="error-text">Please enter a valid 6-digit pincode</span>
            )}
          </div>
        </div>

        {/* Placement Cell Email & Contact Number */}
        <div className="form-grid-2" style={{ marginBottom: '22px' }}>
          <div className="form-group">
            <label className="form-label">Placement Cell Email <span className="req">*</span></label>
            <div className="input-with-icon">
              <input 
                type="email"
                className={`form-control ${touched.placementEmail && !isPlacementEmailValid ? 'invalid' : ''}`}
                placeholder="placement@college.edu.in"
                value={data.placementEmail}
                onChange={(e) => handleChange('placementEmail', e.target.value)}
                onBlur={() => handleBlur('placementEmail')}
                required
              />
              {isPlacementEmailValid && (
                <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
              )}
            </div>
            {touched.placementEmail && !isPlacementEmailValid && (
              <span className="error-text">Please enter a valid placement cell email</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Placement Cell Contact Number <span className="req">*</span></label>
            <div className="phone-input-group">
              <div className="country-selector">
                <span className="flag-icon">🇮🇳</span>
                <span className="code-text">+91</span>
              </div>
              <div className="input-with-icon" style={{ flex: 1 }}>
                <input 
                  type="text"
                  className={`form-control ${touched.placementContactNumber && !isPlacementContactValid ? 'invalid' : ''}`}
                  placeholder="9876543210"
                  value={data.placementContactNumber}
                  onChange={(e) => handleChange('placementContactNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onBlur={() => handleBlur('placementContactNumber')}
                  required
                />
                {isPlacementContactValid && (
                  <CheckCircle2 size={18} className="valid-icon" color="#10B981" />
                )}
              </div>
            </div>
            {touched.placementContactNumber && !isPlacementContactValid && (
              <span className="error-text">Please enter a valid 10-digit contact number</span>
            )}
          </div>
        </div>

        {/* Approx. Final Year Students Eligible & College Website */}
        <div className="form-grid-2" style={{ marginBottom: '28px' }}>
          <div className="form-group">
            <label className="form-label">Approx. Final Year Students Eligible for Placement <span className="req">*</span></label>
            <input 
              type="number"
              className={`form-control ${touched.eligibleStudentsCount && !isStudentsCountValid ? 'invalid' : ''}`}
              placeholder="350"
              min="1"
              value={data.eligibleStudentsCount}
              onChange={(e) => handleChange('eligibleStudentsCount', e.target.value)}
              onBlur={() => handleBlur('eligibleStudentsCount')}
              required
            />
            {touched.eligibleStudentsCount && !isStudentsCountValid && (
              <span className="error-text">Eligible student count is required</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">College Website (Optional)</label>
            <input 
              type="text"
              className="form-control"
              placeholder="https://www.college.edu.in"
              value={data.collegeWebsite}
              onChange={(e) => handleChange('collegeWebsite', e.target.value)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="wizard-footer-actions">
          <button type="button" className="btn-wizard-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          <button 
            type="submit" 
            className={`btn-wizard-primary ${!isFormValid ? 'disabled' : ''}`}
            disabled={!isFormValid}
          >
            <span>Save & Proceed</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
