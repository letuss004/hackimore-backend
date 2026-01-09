/**
 * Form Validation Module
 * Handles demo request form validation and submission
 */

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
      return 'Họ tên phải có ít nhất 2 ký tự';
    }
    if (value.length > 100) {
      return 'Họ tên không được vượt quá 100 ký tự';
    }
    return null;
  }

  validateEmail(value) {
    if (!value || value.trim().length === 0) {
      return 'Email không được để trống';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Email không hợp lệ';
    }
    return null;
  }

  validatePhone(value) {
    if (!value || value.trim().length === 0) {
      return 'Số điện thoại không được để trống';
    }
    // Vietnamese phone number validation
    const phoneRegex = /^(\+84|84|0)[3-9]\d{8}$/;
    const cleanPhone = value.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return 'Số điện thoại không hợp lệ (vd: 0912345678 hoặc +84912345678)';
    }
    return null;
  }

  validateIdea(value) {
    if (!value || value.trim().length < 10) {
      return 'Ý tưởng dự án phải có ít nhất 10 ký tự';
    }
    if (value.length > 255) {
      return 'Ý tưởng dự án không được vượt quá 255 ký tự';
    }
    return null;
  }

  validateDetails(value) {
    if (value && value.length > 5000) {
      return 'Mô tả chi tiết không được vượt quá 5000 ký tự';
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
    this.submitBtn.textContent = isLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu Demo';
  }

  getFormData() {
    return {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      idea: document.getElementById('idea').value.trim(),
      details: document.getElementById('details').value.trim(),
    };
  }

  resetForm() {
    this.form.reset();
    this.clearAllErrors();
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validate form before submission
    if (!this.validateForm()) {
      this.showFormMessage('Vui lòng kiểm tra lại thông tin', false);
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
        this.showFormMessage(
          'Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ bạn ngay.',
          true,
        );
        this.resetForm();
      } else {
        const error = await response.json();
        const errorMessage = error.message || 'Có lỗi xảy ra, vui lòng thử lại.';
        this.showFormMessage(errorMessage, false);

        // Show field-specific errors if available
        if (error.details) {
          Object.keys(error.details).forEach((fieldName) => {
            this.showFieldError(fieldName, error.details[fieldName]);
          });
        }
      }
    } catch (error) {
      this.showFormMessage('Không thể kết nối đến server, vui lòng thử lại.', false);
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

