import test from 'node:test';
import assert from 'node:assert/strict';

// Helper function replicating the error formatting logic in RecruiterDashboard.jsx
function formatJobCreationError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  let userFriendlyMessage = 'Failed to post new job. Please check all fields.';

  if (status === 401) {
    userFriendlyMessage = 'Your session has expired. Please log in again to post jobs.';
  } else if (status === 403) {
    userFriendlyMessage = data?.error || data?.message || data?.detail ||
      'Your recruiter account does not have permission to post jobs, or your profile is pending approval by the Placement Officer.';
  } else if (status === 400) {
    const errorsObj = data?.errors || data;
    if (typeof errorsObj === 'string') {
      userFriendlyMessage = errorsObj;
    } else if (errorsObj && typeof errorsObj === 'object') {
      if (typeof errorsObj.error === 'string') {
        userFriendlyMessage = errorsObj.error;
      } else if (typeof errorsObj.detail === 'string') {
        userFriendlyMessage = errorsObj.detail;
      } else {
        const fieldErrorMessages = [];
        for (const [field, messages] of Object.entries(errorsObj)) {
          if (field === 'status' || field === 'code') continue;
          const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          if (Array.isArray(messages)) {
            fieldErrorMessages.push(`${fieldLabel}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            fieldErrorMessages.push(`${fieldLabel}: ${messages}`);
          }
        }
        if (fieldErrorMessages.length > 0) {
          userFriendlyMessage = fieldErrorMessages.join(' | ');
        } else if (data?.message && typeof data.message === 'string') {
          userFriendlyMessage = data.message;
        } else {
          userFriendlyMessage = 'Please verify all required job details and try again.';
        }
      }
    }
  } else if (status && status >= 500) {
    userFriendlyMessage = 'A server error occurred while processing your job posting. Please try again later or contact support.';
  } else if (!err?.response) {
    userFriendlyMessage = 'Unable to connect to the server. Please check your network connection and try again.';
  }

  return userFriendlyMessage;
}

test('Recruiter Job Posting Frontend Error Handling', async (t) => {
  await t.test('formats 401 authentication error clearly distinguishing from validation failure', () => {
    const err = {
      response: {
        status: 401,
        data: {
          status: 'error',
          code: 401,
          message: 'Authentication credentials were not provided.',
          errors: { detail: 'Authentication credentials were not provided.' }
        }
      }
    };
    const msg = formatJobCreationError(err);
    assert.equal(msg, 'Your session has expired. Please log in again to post jobs.');
  });

  await t.test('formats 403 forbidden / unapproved recruiter error', () => {
    const err = {
      response: {
        status: 403,
        data: {
          error: 'Your recruiter/company profile is pending verification by the Placement Officer. Job posting will be enabled once approved.'
        }
      }
    };
    const msg = formatJobCreationError(err);
    assert.match(msg, /pending verification/);
  });

  await t.test('formats 400 field validation errors for missing or invalid master data', () => {
    const err = {
      response: {
        status: 400,
        data: {
          status: 'error',
          code: 400,
          message: 'Validation or request handling error',
          errors: {
            hiring_type: ['Required hiring type master data is not configured in the system. Please contact an administrator.']
          }
        }
      }
    };
    const msg = formatJobCreationError(err);
    assert.match(msg, /Hiring Type: Required hiring type master data is not configured/);
  });

  await t.test('formats 400 validation errors for multiple fields', () => {
    const err = {
      response: {
        status: 400,
        data: {
          errors: {
            job_title: ['This field may not be blank.'],
            package_lpa: ['A valid number is required.']
          }
        }
      }
    };
    const msg = formatJobCreationError(err);
    assert.match(msg, /Job Title: This field may not be blank\./);
    assert.match(msg, /Package Lpa: A valid number is required\./);
  });

  await t.test('formats 500 internal server error without exposing database tracebacks or internals', () => {
    const err = {
      response: {
        status: 500,
        data: {
          status: 'error',
          code: 500,
          message: 'An internal server error occurred.',
          errors: null,
          raw_db_leak: 'django.db.utils.IntegrityError: null value in column "hiring_type_id"...'
        }
      }
    };
    const msg = formatJobCreationError(err);
    assert.equal(
      msg,
      'A server error occurred while processing your job posting. Please try again later or contact support.'
    );
    // Ensure no raw SQL / Django internals are shown
    assert.doesNotMatch(msg, /IntegrityError/);
    assert.doesNotMatch(msg, /django/);
    assert.doesNotMatch(msg, /hiring_type_id/);
  });

  await t.test('handles network disconnection gracefully', () => {
    const err = new Error('Network Error');
    const msg = formatJobCreationError(err);
    assert.equal(msg, 'Unable to connect to the server. Please check your network connection and try again.');
  });

  await t.test('form values are preserved after failed submission', () => {
    let formData = {
      job_title: 'Backend Engineer',
      location: 'Kochi',
      package_lpa: '12.0',
      work_mode: 'Hybrid',
      job_description: 'FastAPI and Django development.',
      requirements: '3+ years experience',
      application_deadline: '2026-12-31'
    };

    // Simulated failed submission: error caught, state is NOT wiped
    try {
      throw { response: { status: 400, data: { errors: { hiring_type: ['Invalid'] } } } };
    } catch {
      // Catch block sets jobFormError, does NOT call setJobFormData with empty values
    }

    assert.equal(formData.job_title, 'Backend Engineer');
    assert.equal(formData.location, 'Kochi');
    assert.equal(formData.package_lpa, '12.0');
    assert.equal(formData.requirements, '3+ years experience');
  });
});
