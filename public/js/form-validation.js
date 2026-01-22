/**
 * Form Validation Module
 * Handles demo request form validation and submission
 * Supports multi-language (vi, en)
 */

// i18n messages
const messages = {
  vi: {
    fullNameMinLength: 'Họ tên phải có ít nhất 2 ký tự',
    fullNameMaxLength: 'Họ tên không được vượt quá 100 ký tự',
    emailRequired: 'Email không được để trống',
    emailInvalid: 'Email không hợp lệ',
    phoneRequired: 'Số điện thoại không được để trống',
    phoneInvalid: 'Số điện thoại không hợp lệ (vd: 0912345678 hoặc +84912345678)',
    ideaMinLength: 'Ý tưởng dự án phải có ít nhất 10 ký tự',
    ideaMaxLength: 'Ý tưởng dự án không được vượt quá 255 ký tự',
    detailsMaxLength: 'Mô tả chi tiết không được vượt quá 5000 ký tự',
    formError: 'Vui lòng kiểm tra lại thông tin',
    submitSuccess: 'Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ bạn ngay.',
    submitError: 'Có lỗi xảy ra, vui lòng thử lại.',
    networkError: 'Không thể kết nối đến server, vui lòng thử lại.',
    submitting: 'Đang gửi...',
    submit: 'Gửi Yêu Cầu Demo',
  },
  en: {
    fullNameMinLength: 'Full name must be at least 2 characters',
    fullNameMaxLength: 'Full name must not exceed 100 characters',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email format',
    phoneRequired: 'Phone number is required',
    phoneInvalid: 'Invalid phone number (e.g., +84912345678 or international format)',
    ideaMinLength: 'Project idea must be at least 10 characters',
    ideaMaxLength: 'Project idea must not exceed 255 characters',
    detailsMaxLength: 'Detailed description must not exceed 5000 characters',
    formError: 'Please check your information',
    submitSuccess: 'Request submitted successfully! We will contact you shortly.',
    submitError: 'An error occurred, please try again.',
    networkError: 'Cannot connect to server, please try again.',
    submitting: 'Submitting...',
    submit: 'Submit Demo Request',
  },
};

// Get current language from analytics.js or detect from URL
// New structure: / = English (default), /vi/ = Vietnamese
const getLang = () =>
  window.currentLang || (window.location.pathname.startsWith('/vi') ? 'vi' : 'en');
const t = (key) => messages[getLang()]?.[key] || messages.en[key];

class FormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.submitBtn = document.getElementById('submitDemoBtn');
    this.formMessage = document.getElementById('formMessage');

    this.validators = {
      fullName: this.validateFullName.bind(this),
      email: this.validateEmail.bind(this),
      phone: this.validatePhone.bind(this),
      idea: this.validateIdea.bind(this),
      details: this.validateDetails.bind(this),
    };

    this.init();
  }

  init() {
    if (!this.form) return;

    this.attachEventListeners();
  }

  // Validation methods
  validateFullName(value) {
    if (!value || value.trim().length < 2) {
      return t('fullNameMinLength');
    }
    if (value.length > 100) {
      return t('fullNameMaxLength');
    }
    return null;
  }

  validateEmail(value) {
    if (!value || value.trim().length === 0) {
      return t('emailRequired');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return t('emailInvalid');
    }
    return null;
  }

  validatePhone(value) {
    if (!value || value.trim().length === 0) {
      return t('phoneRequired');
    }
    // Support both Vietnamese and international phone numbers
    const phoneRegex = /^(\+?\d{1,4})?[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/;
    const cleanPhone = value.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 8) {
      return t('phoneInvalid');
    }
    return null;
  }

  validateIdea(value) {
    if (!value || value.trim().length < 10) {
      return t('ideaMinLength');
    }
    if (value.length > 255) {
      return t('ideaMaxLength');
    }
    return null;
  }

  validateDetails(value) {
    if (value && value.length > 5000) {
      return t('detailsMaxLength');
    }
    return null;
  }

  // UI methods
  showFieldError(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return false;

    const existingError = field.parentElement.querySelector('.field-error');

    if (existingError) {
      existingError.remove();
    }

    if (errorMessage) {
      field.classList.add('border-red-500');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error text-red-400 text-sm mt-1';
      errorDiv.textContent = errorMessage;
      field.parentElement.appendChild(errorDiv);
      return false;
    } else {
      field.classList.remove('border-red-500');
      return true;
    }
  }

  clearAllErrors() {
    document.querySelectorAll('.field-error').forEach((el) => el.remove());
    document.querySelectorAll('input, textarea').forEach((el) => {
      el.classList.remove('border-red-500');
    });
  }

  validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return true;

    const error = this.validators[fieldId]?.(field.value);
    return this.showFieldError(fieldId, error);
  }

  validateForm() {
    this.clearAllErrors();
    let isValid = true;

    Object.keys(this.validators).forEach((fieldId) => {
      if (!this.validateField(fieldId)) {
        isValid = false;
      }
    });

    return isValid;
  }

  showFormMessage(message, isSuccess = false) {
    this.formMessage.textContent = message;
    this.formMessage.className = `mt-4 text-center ${isSuccess ? 'text-green-400' : 'text-red-400'}`;
    this.formMessage.classList.remove('hidden');
  }

  hideFormMessage() {
    this.formMessage.classList.add('hidden');
  }

  setSubmitButtonState(isLoading) {
    this.submitBtn.disabled = isLoading;
    this.submitBtn.textContent = isLoading ? t('submitting') : t('submit');
  }

  getFormData() {
    return {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      idea: document.getElementById('idea').value.trim(),
      details: document.getElementById('details').value.trim(),
      language: getLang(), // Track source language
    };
  }

  resetForm() {
    this.form.reset();
    this.clearAllErrors();
  }

  // Track form events with language
  trackEvent(eventName, params = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        language: getLang(),
        ...params,
      });
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validate form before submission
    if (!this.validateForm()) {
      this.showFormMessage(t('formError'), false);
      this.trackEvent('form_validation_error', { event_category: 'form' });
      return;
    }

    // Set loading state
    this.setSubmitButtonState(true);
    this.hideFormMessage();

    const formData = this.getFormData();

    try {
      const response = await fetch('/api/v1/pod-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await response.json();
        this.showFormMessage(t('submitSuccess'), true);
        this.resetForm();

        // Track successful submission
        this.trackEvent('demo_request_success', {
          event_category: 'conversion',
          event_label: 'demo_form_submit',
        });
      } else {
        const error = await response.json();
        const errorMessage = error.message || t('submitError');
        this.showFormMessage(errorMessage, false);

        // Show field-specific errors if available
        if (error.details) {
          Object.keys(error.details).forEach((fieldName) => {
            this.showFieldError(fieldName, error.details[fieldName]);
          });
        }

        // Track submission error
        this.trackEvent('demo_request_error', {
          event_category: 'form',
          error_message: errorMessage,
        });
      }
    } catch (error) {
      this.showFormMessage(t('networkError'), false);

      // Track network error
      this.trackEvent('demo_request_network_error', {
        event_category: 'form',
      });
    } finally {
      this.setSubmitButtonState(false);
    }
  }

  attachEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Real-time validation on blur
    Object.keys(this.validators).forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('blur', () => this.validateField(fieldId));

        // Clear error on input
        field.addEventListener('input', () => {
          const existingError = field.parentElement.querySelector('.field-error');
          if (existingError) {
            field.classList.remove('border-red-500');
            existingError.remove();
          }
        });
      }
    });
  }
}

// Initialize form validator when DOM is ready
let formValidator;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    formValidator = new FormValidator('demoRequestForm');
  });
} else {
  formValidator = new FormValidator('demoRequestForm');
}

// Export for global access
window.formValidator = formValidator;
