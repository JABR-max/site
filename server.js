/* ========================================
   JABR Publication Consultancy
   Node.js Backend Server
   ======================================== */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads and data directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Initialize data files
const contactsFile = path.join(dataDir, 'contacts.json');
const newsletterFile = path.join(dataDir, 'newsletter.json');
if (!fs.existsSync(contactsFile)) fs.writeFileSync(contactsFile, '[]');
if (!fs.existsSync(newsletterFile)) fs.writeFileSync(newsletterFile, '[]');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// File upload config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
        }
    }
});

// ---- API: Contact Form ----
app.post('/api/contact', upload.single('manuscript'), (req, res) => {
    try {
        const { fullName, country, email, whatsapp, service, message } = req.body;

        if (!fullName || !country || !email || !service) {
            return res.status(400).json({ error: 'Required fields missing' });
        }

        const contact = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            fullName,
            country,
            email,
            whatsapp: whatsapp || '',
            service,
            message: message || '',
            manuscript: req.file ? req.file.filename : null,
            submittedAt: new Date().toISOString(),
            status: 'new'
        };

        // Append to contacts.json
        const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
        contacts.push(contact);
        fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));

        console.log(`✅ New contact: ${fullName} (${email}) — ${service}`);

        res.json({ success: true, message: 'Thank you! We will contact you within 24 hours.', id: contact.id });
    } catch (err) {
        console.error('Contact form error:', err.message);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// ---- API: Newsletter ----
app.post('/api/newsletter', (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email required' });
        }

        const subscribers = JSON.parse(fs.readFileSync(newsletterFile, 'utf8'));
        if (subscribers.find(s => s.email === email)) {
            return res.json({ success: true, message: 'Already subscribed!' });
        }

        subscribers.push({ email, subscribedAt: new Date().toISOString() });
        fs.writeFileSync(newsletterFile, JSON.stringify(subscribers, null, 2));

        console.log(`📧 New subscriber: ${email}`);
        res.json({ success: true, message: 'Subscribed successfully!' });
    } catch (err) {
        console.error('Newsletter error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ---- API: Get all contacts (admin) ----
app.get('/api/contacts', (req, res) => {
    try {
        const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ error: 'Could not read contacts' });
    }
});

// ---- API: Get all newsletter subscribers (admin) ----
app.get('/api/subscribers', (req, res) => {
    try {
        const subscribers = JSON.parse(fs.readFileSync(newsletterFile, 'utf8'));
        res.json(subscribers);
    } catch (err) {
        res.status(500).json({ error: 'Could not read subscribers' });
    }
});

// ---- Serve frontend ----
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 JABR Publication Consultancy Server`);
    console.log(`   Running on: http://localhost:${PORT}`);
    console.log(`   Contact API: POST /api/contact`);
    console.log(`   Newsletter API: POST /api/newsletter`);
    console.log(`   Contacts List: GET /api/contacts`);
    console.log(`   Subscribers List: GET /api/subscribers\n`);
});
