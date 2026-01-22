/**
 * Language Dropdown Module
 * Handles language switcher dropdown functionality
 */

(function initLanguageDropdown() {
  const dropdownBtn = document.getElementById('langDropdownBtn');
  const dropdownMenu = document.getElementById('langDropdownMenu');

  if (!dropdownBtn || !dropdownMenu) return;

  // Toggle dropdown on button click
  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');

    // Rotate chevron icon
    const chevron = dropdownBtn.querySelector('iconify-icon');
    if (chevron) {
      chevron.style.transform = dropdownMenu.classList.contains('hidden')
        ? 'rotate(0deg)'
        : 'rotate(180deg)';
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.add('hidden');
      const chevron = dropdownBtn.querySelector('iconify-icon');
      if (chevron) {
        chevron.style.transform = 'rotate(0deg)';
      }
    }
  });

  // Close dropdown on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownMenu.classList.add('hidden');
      const chevron = dropdownBtn.querySelector('iconify-icon');
      if (chevron) {
        chevron.style.transform = 'rotate(0deg)';
      }
    }
  });
})();
