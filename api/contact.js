/**
 * ========================================
 * JABR Publication Consultancy
 * Contact Form API Route
 * ========================================
 * Handles file uploads + data storage + email notifications
 */

const fs = require('fs').promises;
const path = require('path');
const { sendEmail, generateAdminEmailTemplate, generateClientEmailTemplate } = require('../config/email');

module.exports = async (req, res) => {
  try {
    const { fullName, country, email, whatsapp, service, message } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // ========== VALIDATION ==========
    if (!fullName?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email'
      });
    }

    console.log('📋 Contact submission:');
    console.log('   Name:', fullName);
    console.log('   Email:', email);
    console.log('   File:', req.file?.filename || 'None');

    // ========== CREATE CONTACT RECORD ==========
    const contactId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    
    const contact = {
      id: contactId,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      country: country?.trim() || '',
      whatsapp: whatsapp?.trim() || '',
      service: service?.trim() || '',
      message: message?.trim() || '',
      manuscript: req.file?.filename || null,
      submittedAt: new Date().toISOString(),
      submittedFrom: clientIp
    };

    // ========== SAVE TO FILE ==========
    try {
      const dataDir = path.join(__dirname, '../data');
      const contactsFile = path.join(dataDir, 'contacts.json');
      
      await fs.mkdir(dataDir, { recursive: true }).catch(() => {});
      
      let allContacts = [];
      try {
        const fileData = await fs.readFile(contactsFile, 'utf8');
        allContacts = JSON.parse(fileData);
      } catch {
        allContacts = [];
      }

      allContacts.push(contact);
      await fs.writeFile(contactsFile, JSON.stringify(allContacts, null, 2), 'utf8');
      console.log(`✅ Contact saved: ${contactId}`);
      
    } catch (err) {
      console.error('⚠️ Save error:', err.message);
    }

    // ========== SEND EMAILS ==========
    try {
      // Send client confirmation
      const clientHtml = generateClientEmailTemplate(contact);
      await sendEmail({
        to: email,
        subject: '✓ Consultation Request Received - JABR Publication Consultancy',
        html: clientHtml,
        text: 'Thank you for contacting JABR. We will respond within 24 hours.'
      });
      console.log(`✅ Email sent to ${email}`);
    } catch (err) {
      console.error('⚠️ Client email error:', err.message);
    }

    try {
      // Send admin notification
      const adminHtml = generateAdminEmailTemplate(contact);
      const adminEmail = process.env.ADMIN_EMAIL || 'jabrpublicationconsultancy@gmail.com';
      
      const adminOptions = {
        to: adminEmail,
        subject: `🎯 New Consultation - ${contact.fullName}`,
        html: adminHtml,
        text: `New submission from ${contact.fullName} (${contact.email})`
      };

      // Attach file if exists
      if (req.file) {
        const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
        try {
          await fs.access(filePath);
          adminOptions.attachments = [{
            filename: req.file.originalname,
            path: filePath
          }];
          console.log(`📎 File attached: ${req.file.filename}`);
        } catch {}
      }

      await sendEmail(adminOptions);
      console.log(`✅ Admin notified`);
    } catch (err) {
      console.error('⚠️ Admin email error:', err.message);
    }

    // ========== RESPONSE ==========
    return res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully',
      contactId: contactId,
      email: email
    });

  } catch (error) {
    console.error('❌ API Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
