const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/v1';

async function testAPI() {
  try {
    console.log('🚀 Testing Tendo Market API...\n');

    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health:', healthResponse.data.message);

    // 2. Test products endpoint
    console.log('\n2. Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    console.log(`✅ Products: ${productsResponse.data.count} items found`);

    // 3. Test product details
    if (productsResponse.data.data && productsResponse.data.data.length > 0) {
      const productId = productsResponse.data.data[0]._id;
      console.log(`\n3. Testing product details (${productId})...`);
      const productResponse = await axios.get(`${API_BASE}/products/${productId}`);
      console.log(`✅ Product: ${productResponse.data.data.product.name.ru || productResponse.data.data.product.name}`);
    }

    // 4. Test admin login
    console.log('\n4. Testing admin login...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/admin/login`, {
        email: 'admin@chexol.uz',
        password: 'admin123'
      });
      console.log('✅ Admin login successful');
      const token = loginResponse.data.token;

      // 5. Test admin endpoints with token
      console.log('\n5. Testing admin stats...');
      const adminStats = await axios.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Admin stats: ${adminStats.data.data.orders} orders, ${adminStats.data.data.users} users`);

      // 6. Test creating a product
      console.log('\n6. Testing product creation...');
      const categories = await axios.get(`${API_BASE}/categories`);
      if (categories.data.data && categories.data.data.length > 0) {
        const categoryId = categories.data.data[0]._id;
        const newProduct = await axios.post(`${API_BASE}/products`, {
          name: { ru: 'Тестовый товар', uz: 'Test mahsulot', en: 'Test product' },
          description: { ru: 'Описание тестового товара', uz: 'Test mahsulot tavsifi', en: 'Test product description' },
          price: 50000,
          category: categoryId,
          brand: 'TestBrand',
          material: 'silicone',
          stock: 10,
          isActive: true
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Product created:', newProduct.data.data.name.ru);
      }

    } catch (loginError) {
      console.log('❌ Admin login failed:', loginError.response?.data?.error || loginError.message);
    }

    console.log('\n🎉 API testing completed successfully!');

  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
  }
}

testAPI();



