/**
 * ========================================
 * JABR Publication Consultancy
 * Newsletter Subscription API Route
 * ========================================
 * Secure newsletter subscription handling
 */

const fs = require('fs').promises;
const path = require('path');
const { sanitizeInput, validateEmail } = require('../middleware/input-sanitizer');

/**
 * Handle newsletter subscription
 * POST /api/newsletter
 * 
 * Security features:
 * - Email validation
 * - Input sanitization
 * - Duplicate prevention
 * - Rate limiting
 * 
 * TODO: Integrate with email service
 * TODO: Add double opt-in (DOI)
 * TODO: Database integration
 */
module.exports = async (req, res) => {
  try {
    const { email } = req.body;

    // ========== VALIDATION ==========
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // ========== DUPLICATE CHECK ==========
    // TODO: Replace with database query
    let subscribers = [];
    try {
      const subscribersFile = path.join(__dirname, '../data/newsletter.json');
      const dataDir = path.dirname(subscribersFile);
      
      // Ensure data directory exists
      await fs.mkdir(dataDir, { recursive: true }).catch(() => {});
      
      try {
        const data = await fs.readFile(subscribersFile, 'utf8');
        subscribers = JSON.parse(data);
      } catch {
        subscribers = [];
      }

      // Check if already subscribed
      if (subscribers.some(s => s.email === sanitizedEmail)) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to our newsletter.',
          alreadySubscribed: true
        });
      }

      // ========== CREATE SUBSCRIPTION RECORD ==========
      const subscription = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        email: sanitizedEmail,
        subscribedAt: new Date().toISOString(),
        status: 'active',
        confirmationSent: false,
        confirmationToken: null,
        confirmed: false
      };

      // Add new subscription
      subscribers.push(subscription);

      // Save to file (NOT committed to repo)
      await fs.writeFile(subscribersFile, JSON.stringify(subscribers, null, 2));

      console.log(`📧 New newsletter subscriber: ${sanitizedEmail}`);

      // ========== SEND CONFIRMATION EMAIL ==========
      // TODO: Implement double opt-in with confirmation link
      // await sendConfirmationEmail(sanitizedEmail, subscription.confirmationToken);

      // ========== RESPONSE ==========
      return res.status(201).json({
        success: true,
        message: 'Successfully subscribed to our newsletter! Check your email for confirmation.',
        email: sanitizedEmail
      });

    } catch (err) {
      console.error('Newsletter subscription error:', err);
      throw err;
    }

  } catch (err) {
    console.error('Newsletter API error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};
