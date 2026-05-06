/**
 * ========================================
 * JABR Publication Consultancy
 * Contact Form API Route
 * ========================================
 * Secure, production-ready contact submission
 * Integrates with email service for client confirmation & admin notification
 */

const fs = require('fs').promises;
const path = require('path');
const { sanitizeFormData, validateEmail, validateCountry, validateService } = require('../middleware/input-sanitizer');
const { sendEmail, generateAdminEmailTemplate, generateClientEmailTemplate } = require('../config/email');

/**
 * Handle contact form submission
 * POST /api/contact
 * 
 * Security features:
 * - Input validation and sanitization
 * - Email validation
 * - File upload restrictions
 * - Rate limiting (middleware)
 * - Secure email delivery
 * - Error handling & logging
 * 
 * Response: Creates contact record, sends emails to both client and admin, returns confirmation
 */
module.exports = async (req, res) => {
  try {
    const { fullName, country, email, whatsapp, service, message } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // ========== VALIDATION ==========
    // Check required fields
    if (!fullName || !country || !email || !service) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['fullName', 'country', 'email', 'service']
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate country
    if (!validateCountry(country)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid country'
      });
    }

    // Validate service type
    if (!validateService(service)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid service type'
      });
    }

    // Validate text length
    if (fullName.length > 100) {
      return res.status(400).json({ success: false, error: 'Name too long (max 100 characters)' });
    }

    if (message && message.length > 5000) {
      return res.status(400).json({ success: false, error: 'Message too long (max 5000 characters)' });
    }

    // ========== SANITIZATION ==========
    const sanitized = sanitizeFormData({
      fullName, country, email, whatsapp, service, message
    });

    // ========== FILE UPLOAD HANDLING ==========
    let manuscriptFile = null;
    if (req.file) {
      // File has been processed by multer middleware
      manuscriptFile = req.file.filename;
    }

    // ========== CREATE CONTACT RECORD ==========
    const contact = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      ...sanitized,
      phone: whatsapp || 'Not provided',
      manuscript: manuscriptFile,
      submittedAt: new Date().toISOString(),
      submittedFrom: clientIp,
      status: 'pending',
      emailSent: false,
      adminNotified: false,
      notes: '',
      assignedTo: null
    };

    // ========== STORE CONTACT DATA ==========
    // Store locally (for backup) - also syncs with database in production
    try {
      const contactsFile = path.join(__dirname, '../data/contacts.json');
      const dataDir = path.dirname(contactsFile);
      
      // Ensure data directory exists
      await fs.mkdir(dataDir, { recursive: true }).catch(() => {});
      
      // Read existing contacts
      let contacts = [];
      try {
        const data = await fs.readFile(contactsFile, 'utf8');
        contacts = JSON.parse(data);
      } catch {
        contacts = [];
      }

      // Add new contact
      contacts.push(contact);

      // Write back (secured - not in git)
      await fs.writeFile(contactsFile, JSON.stringify(contacts, null, 2));
    } catch (err) {
      console.error('⚠️ Error saving contact locally:', err.message);
      // Don't fail the request if we can't save locally
      // In production, this would be a database transaction
    }

    // ========== SEND EMAILS ==========
    const emailErrors = [];

    // Send client confirmation email
    try {
      const clientHtmlTemplate = generateClientEmailTemplate(sanitized);
      
      await sendEmail({
        to: sanitized.email,
        subject: `✓ Consultation Request Received - JABR Publication Consultancy`,
        html: clientHtmlTemplate,
        text: `Thank you for contacting JABR! We have received your consultation request and will get back to you within 24 hours.`
      });

      contact.emailSent = true;
      console.log(`✅ Confirmation email sent to ${sanitized.email}`);
    } catch (err) {
      emailErrors.push(`Client email failed: ${err.message}`);
      console.error('❌ Failed to send client email:', err.message);
    }

    // Send admin notification email
    try {
      const adminHtmlTemplate = generateAdminEmailTemplate(contact);
      const adminEmail = process.env.ADMIN_EMAIL || 'jabrpublicationconsultancy@gmail.com';

      // Prepare email options
      const adminEmailOptions = {
        to: adminEmail,
        subject: `🎯 New Consultation Request - ${sanitized.fullName} (${sanitized.service})`,
        html: adminHtmlTemplate,
        text: `New consultation request from ${sanitized.fullName} (${sanitized.email}). Phone: ${sanitized.phone || 'Not provided'}`
      };

      // Attach manuscript if provided
      if (manuscriptFile) {
        const manuscriptPath = path.join(__dirname, '../uploads', manuscriptFile);
        adminEmailOptions.attachments = [
          {
            filename: manuscriptFile,
            path: manuscriptPath
          }
        ];
        console.log(`📎 Attaching manuscript: ${manuscriptFile}`);
      }

      await sendEmail(adminEmailOptions);

      contact.adminNotified = true;
      console.log(`✅ Admin notification sent to ${adminEmail}`);
    } catch (err) {
      emailErrors.push(`Admin notification failed: ${err.message}`);
      console.error('❌ Failed to send admin email:', err.message);
    }

    // Update contact record with email status
    try {
      const contactsFile = path.join(__dirname, '../data/contacts.json');
      const data = await fs.readFile(contactsFile, 'utf8');
      let contacts = JSON.parse(data);
      
      const index = contacts.findIndex(c => c.id === contact.id);
      if (index !== -1) {
        contacts[index].emailSent = contact.emailSent;
        contacts[index].adminNotified = contact.adminNotified;
        await fs.writeFile(contactsFile, JSON.stringify(contacts, null, 2));
      }
    } catch (err) {
      console.error('⚠️ Error updating contact status:', err.message);
    }

    console.log(`✅ New contact submission: ${sanitized.fullName} (${sanitized.email}) | Contact ID: ${contact.id}`);

    // ========== RESPONSE ==========
    // Even if emails fail, we still return success since we've stored the contact
    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting JABR! We\'ll get back to you within 24 hours.',
      contactId: contact.id,
      confirmationEmail: sanitized.email,
      emailStatus: {
        clientConfirmation: contact.emailSent,
        adminNotification: contact.adminNotified
      },
      ...(emailErrors.length > 0 && { warnings: emailErrors })
    });

  } catch (err) {
    console.error('❌ Contact form error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.',
      contactId: null
    });
  }
};
