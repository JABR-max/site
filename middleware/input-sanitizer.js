/**
 * ========================================
 * JABR Publication Consultancy
 * Input Sanitization Utilities
 * ========================================
 * Prevents XSS and injection attacks
 */

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
function validatePhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate country code
 * @param {string} country - Country code
 * @returns {boolean} True if valid
 */
function validateCountry(country) {
  const validCountries = [
    'IN', 'US', 'UK', 'CA', 'AU', 'NZ', 'SG', 'MY', 'PH', 'ID',
    'TH', 'VN', 'BD', 'PK', 'LK', 'NG', 'ZA', 'KE', 'EG', 'AE',
    'SA', 'JP', 'CN', 'KR', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE',
    'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'RU', 'BR', 'MX', 'AR'
  ];
  return validCountries.includes(country?.toUpperCase());
}

/**
 * Validate service type
 * @param {string} service - Service type
 * @returns {boolean} True if valid
 */
function validateService(service) {
  const validServices = [
    'scopus-publication',
    'sci-scie-targeting',
    'web-of-science',
    'q1-q2-identification',
    'manuscript-editing',
    'plagiarism-reduction',
    'statistical-analysis',
    'thesis-formatting',
    'conference-papers',
    'research-consultation'
  ];
  return validServices.includes(service?.toLowerCase());
}

/**
 * Sanitize all fields in request body
 * @param {Object} data - Object with user data
 * @returns {Object} Sanitized object
 */
function sanitizeFormData(data) {
  return {
    fullName: sanitizeInput(data.fullName || ''),
    email: sanitizeInput(data.email || '').toLowerCase(),
    country: sanitizeInput(data.country || ''),
    whatsapp: sanitizeInput(data.whatsapp || ''),
    service: sanitizeInput(data.service || ''),
    message: sanitizeInput(data.message || '')
  };
}

module.exports = {
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateCountry,
  validateService,
  sanitizeFormData
};
