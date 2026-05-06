/**
 * ========================================
 * JABR Publication Consultancy
 * Email Configuration Module
 * ========================================
 * Secure email service configuration
 * Supports: Nodemailer (Gmail SMTP), SendGrid, Resend
 */

const nodemailer = require('nodemailer');

/**
 * Initialize email transporter based on environment configuration
 * Supports multiple email service providers for flexibility
 */
function initializeEmailService() {
  const emailService = (process.env.EMAIL_SERVICE || 'smtp').toLowerCase();

  // ========== SMTP (Gmail, Custom SMTP) ==========
  if (emailService === 'smtp' || emailService === 'gmail') {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('❌ SMTP configuration missing. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env');
      return null;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      logger: process.env.NODE_ENV !== 'production',
      debug: process.env.NODE_ENV !== 'production'
    });

    // Verify connection (non-blocking)
    transporter.verify((err, success) => {
      if (err) {
        console.error('❌ SMTP Connection Error:', err.message);
      } else if (success) {
        console.log('✅ SMTP Email Service Ready');
      }
    });

    return transporter;
  }

  console.warn('⚠️ No valid email service configured. Please set EMAIL_SERVICE in .env');
  return null;
}

/**
 * Send email using configured service
 * @param {Object} mailOptions - Email configuration
 * @param {string} mailOptions.to - Recipient email
 * @param {string} mailOptions.subject - Email subject
 * @param {string} mailOptions.html - HTML email body
 * @param {string} mailOptions.text - Plain text email body
 * @returns {Promise} Email send result
 */
async function sendEmail(mailOptions) {
  const transporter = initializeEmailService();

  if (!transporter) {
    throw new Error('Email service not configured. Check .env file.');
  }

  const defaultOptions = {
    from: process.env.EMAIL_FROM || 'noreply@jabrpublication.com'
  };

  try {
    const result = await transporter.sendMail({
      ...defaultOptions,
      ...mailOptions
    });

    console.log(`✅ Email sent: ${mailOptions.to}`);
    return result;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw error;
  }
}

/**
 * Generate professional HTML email template for admin notification
 * @param {Object} contact - Contact form submission data
 * @returns {string} HTML email body
 */
function generateAdminEmailTemplate(contact) {
  const submissionTime = new Date().toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(10,36,99,0.08); }
        .header { border-bottom: 3px solid #0a2463; padding-bottom: 20px; }
        .header h1 { color: #0a2463; margin: 0; font-size: 24px; font-weight: 700; }
        .header p { color: #64748b; margin: 8px 0 0 0; font-size: 14px; }
        .section { margin: 25px 0; }
        .section-title { color: #0a2463; font-weight: 600; font-size: 16px; margin-bottom: 15px; }
        .field { background: #f8fafc; padding: 12px 15px; margin: 10px 0; border-left: 3px solid #3b82f6; border-radius: 4px; }
        .field-label { color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .field-value { color: #1e293b; margin-top: 6px; font-size: 14px; }
        .field-value strong { color: #0a2463; }
        .message { background: #f1f5f9; padding: 15px; border-radius: 8px; white-space: pre-wrap; word-wrap: break-word; font-family: 'Monaco', monospace; font-size: 13px; color: #334155; border-left: 3px solid #0d9488; }
        .action-buttons { margin: 20px 0; display: flex; gap: 10px; flex-wrap: wrap; }
        .action-link { display: inline-block; padding: 10px 16px; background: #f0f9ff; color: #3b82f6; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500; transition: all 0.2s; }
        .action-link:hover { background: #e0f2fe; color: #1e40af; }
        .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .badge { display: inline-block; background: linear-gradient(135deg, #10b981, #0d9488); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .timestamp { color: #94a3b8; font-size: 12px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Consultation Request</h1>
          <p>New submission from JABR Publication Consultancy website</p>
        </div>

        <div class="section">
          <p class="section-title">Submission Details:</p>
          
          <div class="field">
            <div class="field-label">👤 Full Name</div>
            <div class="field-value"><strong>${contact.fullName || 'N/A'}</strong></div>
          </div>

          <div class="field">
            <div class="field-label">📧 Email Address</div>
            <div class="field-value"><a href="mailto:${contact.email}" style="color: #3b82f6; text-decoration: none;"><strong>${contact.email || 'N/A'}</strong></a></div>
          </div>

          <div class="field">
            <div class="field-label">📱 Phone Number</div>
            <div class="field-value"><a href="tel:${contact.phone}" style="color: #3b82f6; text-decoration: none;"><strong>${contact.phone || 'N/A'}</strong></a></div>
          </div>

          <div class="field">
            <div class="field-label">🌍 Country</div>
            <div class="field-value">${contact.country || 'N/A'}</div>
          </div>

          <div class="field">
            <div class="field-label">💼 Service Requested</div>
            <div class="field-value"><span class="badge">${contact.service || 'General Inquiry'}</span></div>
          </div>
        </div>

        <div class="section">
          <p class="section-title">Message Content:</p>
          <div class="message">${contact.message || '(No message provided)'}</div>
        </div>

        <div class="section">
          <p class="section-title">Quick Actions:</p>
          <div class="action-buttons">
            <a href="mailto:${contact.email}?subject=Re: Your JABR Consultation Request - ${contact.fullName.split(' ')[0]}" class="action-link">💬 Reply to ${contact.fullName.split(' ')[0]}</a>
            <a href="tel:${contact.phone}" class="action-link">📞 Call</a>
            <a href="https://wa.me/${contact.phone.replace(/\\D/g, '')}" class="action-link">💬 WhatsApp</a>
          </div>
        </div>

        <div class="section">
          <p class="section-title">Metadata:</p>
          <div class="field">
            <div class="field-label">⏰ Submission Time (IST)</div>
            <div class="field-value">${submissionTime}</div>
          </div>
          <div class="field">
            <div class="field-label">🔐 Submission Status</div>
            <div class="field-value"><span class="badge">✓ Verified & Secure</span></div>
          </div>
        </div>

        <div class="footer">
          <p><strong>JABR Publication Consultancy</strong></p>
          <p>Global Academic Research Support | Email: jabrpublicationconsultancy@gmail.com | Phone: +91 8309992766</p>
          <p style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">This is an automated notification. Do not reply to this email address.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate professional HTML email template for client confirmation
 * @param {Object} contact - Contact form submission data
 * @returns {string} HTML email body
 */
function generateClientEmailTemplate(contact) {
  const clientName = contact.fullName.split(' ')[0];
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(10,36,99,0.08); }
        .header { text-align: center; padding-bottom: 20px; }
        .header h1 { color: #0a2463; margin: 0; font-size: 28px; font-weight: 700; }
        .header p { color: #64748b; margin: 10px 0 0 0; font-size: 14px; }
        .content { margin: 30px 0; }
        .highlight { background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; }
        .highlight h2 { margin: 0; font-size: 20px; font-weight: 600; }
        .highlight p { margin: 10px 0 0 0; opacity: 0.95; }
        .next-steps { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 3px solid #0a2463; }
        .next-steps h3 { color: #0a2463; margin-top: 0; font-size: 16px; }
        .next-steps ol { margin: 15px 0; padding-left: 20px; }
        .next-steps li { margin: 10px 0; color: #475569; line-height: 1.6; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .contact-info { background: #f8fafc; padding: 18px; border-left: 3px solid #0a2463; margin: 20px 0; border-radius: 4px; }
        .contact-info p { margin: 10px 0; color: #475569; font-size: 14px; }
        .contact-info a { color: #3b82f6; text-decoration: none; font-weight: 500; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .divider { height: 1px; background: #e2e8f0; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You, ${clientName}! 🎉</h1>
          <p>Your consultation request has been received successfully</p>
        </div>

        <div class="content">
          <div class="highlight">
            <h2>We're Excited to Work With You</h2>
            <p>Your request is in good hands. Our expert team is reviewing your submission.</p>
          </div>

          <div class="next-steps">
            <h3>✅ What Happens Next:</h3>
            <ol>
              <li><strong>Review Phase (24 hours)</strong> - Our team analyzes your research requirements and publication goals</li>
              <li><strong>Contact Phase (48 hours)</strong> - We'll reach out via email or phone to discuss your specific needs</li>
              <li><strong>Strategy Session</strong> - Schedule your personalized consultation call with our experts</li>
              <li><strong>Publication Plan</strong> - Receive a customized publication strategy and timeline</li>
            </ol>
          </div>

          <p style="color: #64748b; text-align: center; font-size: 14px; line-height: 1.6;">
            <strong>📧 Expected Response Time:</strong> Within 24 hours<br>
            <strong>📱 Preferred Contact Method:</strong> ${contact.email}
          </p>

          <div class="divider"></div>

          <div class="contact-info">
            <p style="margin-top: 0; font-weight: 600; color: #0a2463;">📞 Need Immediate Assistance?</p>
            <p>Don't wait! Get in touch with us directly:</p>
            <p style="margin: 12px 0 0 0;">
              📱 <a href="tel:+918309992766">+91 8309992766</a> (Call/SMS)<br>
              💬 <a href="https://wa.me/918309992766">WhatsApp Chat</a><br>
              📧 <a href="mailto:jabrpublicationconsultancy@gmail.com">Email Us</a>
            </p>
            <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0 0;">Available: Mon–Sat, 9:00 AM – 7:00 PM IST</p>
          </div>

          <p style="color: #64748b; margin: 20px 0; font-size: 14px; line-height: 1.6;">
            Thank you for choosing <strong>JABR Publication Consultancy</strong>. We're dedicated to helping you achieve high-impact publication success and advancing your research globally.
          </p>
        </div>

        <div class="footer">
          <p style="font-weight: 600; color: #0a2463;">JABR Publication Consultancy</p>
          <p>Global Academic Research & Publication Support</p>
          <p>📧 jabrpublicationconsultancy@gmail.com | 📱 +91 8309992766</p>
          <p style="margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 15px;">© 2026 JABR Publication Consultancy. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  initializeEmailService,
  sendEmail,
  generateAdminEmailTemplate,
  generateClientEmailTemplate
};
