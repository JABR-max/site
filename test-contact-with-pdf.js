#!/usr/bin/env node
/**
 * Test Contact Form API with PDF File Upload
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// Create a simple test PDF file
const testPdfPath = path.join(__dirname, 'test-manuscript.pdf');
const pdfContent = Buffer.from('%PDF-1.4\n%test pdf file\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 50 700 Td (Test Document) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000193 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n287\n%%EOF');

fs.writeFileSync(testPdfPath, pdfContent);
console.log('✓ Test PDF file created\n');

const form = new FormData();
form.append('fullName', 'John Doe');
form.append('email', 'john.doe@example.com');
form.append('country', 'US');
form.append('service', 'scopus-publication');
form.append('whatsapp', '+1-234-567-8900');
form.append('message', 'I am interested in publishing my research in a Scopus indexed journal.');
form.append('manuscript', fs.createReadStream(testPdfPath), 'test-manuscript.pdf');

console.log('📝 Submitting contact form with PDF attachment...\n');

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/contact',
  method: 'POST',
  headers: form.getHeaders()
}, (res) => {
  let data = '';

  console.log(`Status Code: ${res.statusCode}\n`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📧 API Response:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('\n✅ SUCCESS! Contact form with PDF submitted successfully.');
        console.log('\n📬 The following emails should be sent:');
        console.log(`   1️⃣  Client confirmation → ${response.confirmationEmail}`);
        console.log(`   2️⃣  Admin notification → jabrpublicationconsultancy@gmail.com`);
        console.log(`       ├─ With attached PDF: test-manuscript.pdf`);
        console.log(`       ├─ Contact ID: ${response.contactId}`);
        console.log(`       ├─ Client email: john.doe@example.com`);
        console.log(`       ├─ Phone: +1-234-567-8900`);
        console.log(`       └─ Service: scopus-publication`);
      } else {
        console.log('\n❌ Error:', response.error);
      }
    } catch (e) {
      console.log('Raw Response:', data);
    }

    // Cleanup test file
    fs.unlinkSync(testPdfPath);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`❌ Problem with request: ${e.message}`);
  console.error('\nIs the server running on localhost:3000?');
  fs.unlinkSync(testPdfPath);
  process.exit(1);
});

form.pipe(req);
