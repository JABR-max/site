#!/usr/bin/env node
/**
 * Test Contact Form API
 */

const http = require('http');

const testData = {
  fullName: "Test User",
  email: "test.user.jabr@gmail.com",
  country: "IN",
  service: "scopus-publication",
  message: "Testing the fixed contact form"
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/contact',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  console.log(`\nStatus Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('API Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('\n✅ SUCCESS! Contact form is working correctly.');
        console.log('   Two emails should be sent:');
        console.log(`   1. Confirmation to: ${testData.email}`);
        console.log(`   2. Admin notification to: jabrpublicationconsultancy@gmail.com`);
      } else {
        console.log('\n❌ Error:', response.error);
      }
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  console.error('\nIs the server running on localhost:3000?');
});

console.log('Testing Contact Form API...');
console.log('Sending test data:', testData);

req.write(postData);
req.end();
