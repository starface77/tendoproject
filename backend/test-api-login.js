const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/admin/login', {
      email: 'admin@tendo.uz',
      password: 'admin123456'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Response Error:', error.response.data);
    } else if (error.request) {
      console.log('Request Error:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testAdminLogin();