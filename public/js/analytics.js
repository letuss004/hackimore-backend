/**
 * Analytics Tracking Module
 * Handles Google Tag Manager and Google Analytics initialization
 */

// Google Tag Manager initialization
(function initGTM(w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });
  const f = d.getElementsByTagName(s)[0];
  const j = d.createElement(s);
  const dl = l !== 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-PSB5LN23');

// Google Analytics initialization
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());

// Detect current language from URL path
// New structure: / = English (default), /vi/ = Vietnamese
const currentLang = window.location.pathname.startsWith('/vi') ? 'vi' : 'en';

// Configure GA with language custom dimension
gtag('config', 'G-TS4BKGY1H4', {
  custom_map: {
    dimension1: 'language',
  },
  language: currentLang,
});

// Export gtag and currentLang for global access
window.gtag = gtag;
window.currentLang = currentLang;
