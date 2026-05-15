/**
 * ========================================
 * JABR Publication Consultancy
 * Contact Form API Route
 * ========================================
 * 
 * Purpose:
 * - Store contact submissions in database/JSON
 * - Handle file uploads
 * - Email sending is handled by EmailJS on frontend
 * 
 * NOTE: EmailJS handles all email delivery to avoid Gmail issues
 */

const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
  try {
    const { fullName, country, email, whatsapp, service, message } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // ========== BASIC VALIDATION ==========
    if (!fullName?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    console.log('📋 Contact submission received:');
    console.log('   Name:', fullName);
    console.log('   Email:', email);
    console.log('   File:', req.file?.filename || 'None');

    // ========== CREATE CONTACT RECORD ==========
    const contactId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    
    const contact = {
      id: contactId,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      country: country?.trim() || 'Not specified',
      whatsapp: whatsapp?.trim() || 'Not provided',
      service: service?.trim() || 'Not specified',
      message: message?.trim() || '',
      manuscript: req.file?.filename || null,
      submittedAt: new Date().toISOString(),
      submittedFrom: clientIp
    };

    // ========== SAVE TO JSON FILE ==========
    try {
      const dataDir = path.join(__dirname, '../data');
      const contactsFile = path.join(dataDir, 'contacts.json');
      
      // Create data directory if it doesn't exist
      await fs.mkdir(dataDir, { recursive: true }).catch(() => {});
      
      // Read existing contacts
      let allContacts = [];
      try {
        const fileData = await fs.readFile(contactsFile, 'utf8');
        allContacts = JSON.parse(fileData);
      } catch {
        allContacts = [];
      }

      // Add new contact
      allContacts.push(contact);

      // Save updated list
      await fs.writeFile(
        contactsFile, 
        JSON.stringify(allContacts, null, 2),
        'utf8'
      );

      console.log(`✅ Contact saved: ${contactId}`);
      
    } catch (err) {
      console.error('⚠️ Error saving contact:', err.message);
      // Don't fail - still return success since EmailJS handled the user notification
    }

    // ========== SUCCESS RESPONSE ==========
    return res.status(201).json({
      success: true,
      message: 'Consultation request received successfully',
      contactId: contactId,
      email: email,
      note: 'Email notification sent via EmailJS'
    });

  } catch (error) {
    console.error('❌ API Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error processing submission'
    });
  }
};
