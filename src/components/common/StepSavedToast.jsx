import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import './StepSavedToast.css';

export default function StepSavedToast({ title = "Saved Successfully", summary = "", onClose, duration = 4500 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="step-saved-toast-container" role="alert" aria-live="polite">
      <div className="toast-icon-wrapper">
        <CheckCircle2 size={20} />
      </div>
      <div className="toast-content-body">
        <div className="toast-title-text">{title}</div>
        {summary && <div className="toast-summary-text">{summary}</div>}
      </div>
      <button 
        className="toast-close-btn" 
        onClick={onClose} 
        aria-label="Close notification"
        title="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
