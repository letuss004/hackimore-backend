/**
 * Slider Navigation Module
 * Handles slide transitions, navigation controls, and keyboard/touch/wheel events
 */

class SliderManager {
  constructor(sliderId, totalSlides) {
    this.slider = document.getElementById(sliderId);
    this.totalSlides = totalSlides;
    this.currentSlide = 0;
    this.isScrolling = false;
    this.scrollDebounceTime = 700;

    this.prevBtnContainer = document.getElementById('prevBtn');
    this.nextBtnContainer = document.getElementById('nextBtn');

    this.init();
  }

  isMobileDevice() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) || window.innerWidth <= 768
    );
  }

  init() {
    this.updateNavButtons();
    this.updateActiveNav();
    this.attachEventListeners();
  }

  updateNavButtons() {
    // Hide prev button on first slide
    if (this.currentSlide === 0) {
      this.prevBtnContainer.style.opacity = '0';
      this.prevBtnContainer.style.pointerEvents = 'none';
    } else {
      this.prevBtnContainer.style.opacity = '1';
      this.prevBtnContainer.style.pointerEvents = 'auto';
    }

    // Hide next button on last slide
    if (this.currentSlide === this.totalSlides - 1) {
      this.nextBtnContainer.style.opacity = '0';
      this.nextBtnContainer.style.pointerEvents = 'none';
    } else {
      this.nextBtnContainer.style.opacity = '1';
      this.nextBtnContainer.style.pointerEvents = 'auto';
    }
  }

  updateSlider() {
    this.slider.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    this.updateNavButtons();
    this.updateActiveNav();
  }

  updateActiveNav() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item) => {
      const slideIndex = parseInt(item.getAttribute('data-slide'));
      if (slideIndex === this.currentSlide) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.updateSlider();
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlider();
    }
  }

  goToSlide(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentSlide = index;
      this.updateSlider();
    }
  }

  handleKeyboardNavigation(e) {
    if (e.key === 'ArrowRight') {
      this.nextSlide();
    } else if (e.key === 'ArrowLeft') {
      this.prevSlide();
    }
  }

  handleWheelNavigation(e) {
    if (this.isScrolling) return;

    if (e.deltaY > 0) {
      // Scroll down -> next slide
      this.nextSlide();
    } else if (e.deltaY < 0) {
      // Scroll up -> previous slide
      this.prevSlide();
    }

    this.isScrolling = true;
    setTimeout(() => {
      this.isScrolling = false;
    }, this.scrollDebounceTime);
  }

  handleSwipe(touchStartY, touchEndY) {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe up -> next slide
        this.nextSlide();
      } else {
        // Swipe down -> previous slide
        this.prevSlide();
      }
    }
  }

  attachEventListeners() {
    let touchStartY = 0;
    let touchEndY = 0;

    // Utility navigation - only on desktop
    if (!this.isMobileDevice()) {
      document.addEventListener('wheel', (e) => this.handleWheelNavigation(e));
      document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
      document.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
      });
      document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        this.handleSwipe(touchStartY, touchEndY);
      });
    }

    // Navigation button clicks
    const prevBtn = this.prevBtnContainer.querySelector('button');
    const nextBtn = this.nextBtnContainer.querySelector('button');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevSlide());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // Desktop nav clicks
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const slideIndex = parseInt(item.getAttribute('data-slide'));
        this.goToSlide(slideIndex);
      });
    });

    // Logo click
    const logoLink = document.querySelector('header a[href="#"]');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToSlide(0);
      });
    }

    // CTA button in header
    const headerCtaButton = document.querySelector('header a.hidden.md\\:flex');
    if (headerCtaButton) {
      headerCtaButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToSlide(6);
      });
    }

    // All demo request buttons (by aria-label or content)
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach((btn) => {
      const ariaLabel = btn.getAttribute('aria-label');
      const buttonText = btn.textContent.trim();

      // Check if button is for demo request
      if (
        ariaLabel?.includes('Yêu Cầu Demo') ||
        ariaLabel?.includes('Yêu cầu demo') ||
        buttonText.includes('Yêu Cầu Demo') ||
        buttonText.includes('Yêu cầu demo') ||
        buttonText.includes('demo miễn phí') ||
        buttonText.includes('demo tùy chỉnh')
      ) {
        // Skip if it's already the submit button (has id)
        if (btn.id !== 'submitDemoBtn') {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.goToSlide(6);
          });
        }
      }
    });
  }
}

// Initialize slider when DOM is ready
let sliderManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    sliderManager = new SliderManager('slider', 7);
  });
} else {
  sliderManager = new SliderManager('slider', 7);
}

// Export for global access (for backward compatibility)
window.sliderManager = sliderManager;
