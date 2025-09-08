/**
 * 🧪 MARKETPLACE FUNCTIONALITY TESTING SCRIPT
 * Tests core features: categories, products, search, filters
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/v1';
const FRONTEND_BASE = 'http://localhost:3000';

// Test configuration
const testConfig = {
  timeout: 15000, // Increased to 15 seconds
  maxRetries: 3
};

// Test results storage
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await axios({
      url: `${API_BASE}${endpoint}`,
      timeout: testConfig.timeout,
      ...options
    });
    return response.data;
  } catch (error) {
    throw {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      endpoint
    };
  }
};

// Test runner function
const runTest = async (testName, testFn) => {
  try {
    console.log(`🧪 Testing: ${testName}`);
    await testFn();
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message || error}`);
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message || error });
  }
};

// Test 1: API Health Check
const testApiHealth = async () => {
  const response = await axios.get(`${API_BASE}/health`, { timeout: 5000 });
  if (response.status !== 200) {
    throw new Error(`API health check failed with status ${response.status}`);
  }
};

// Test 2: Categories API
const testCategoriesApi = async () => {
  // Test getting all categories
  const categoriesResponse = await apiRequest('/categories');
  if (!categoriesResponse.success) {
    throw new Error('Categories API failed - no success field');
  }
  
  // Check if categories data exists (either in 'categories' or 'data' field)
  const categoriesData = categoriesResponse.categories || categoriesResponse.data;
  if (!Array.isArray(categoriesData)) {
    throw new Error('Categories API did not return expected format - missing categories array');
  }

  if (categoriesData.length === 0) {
    console.log('⚠️  No categories found - this might be expected if database is empty');
  }

  // Test getting featured categories
  const featuredResponse = await apiRequest('/categories/featured');
  if (!featuredResponse.success) {
    throw new Error('Featured categories API failed');
  }

  // Test getting category by slug if categories exist
  if (categoriesData.length > 0) {
    const firstCategory = categoriesData[0];
    if (firstCategory.slug) {
      const categoryResponse = await apiRequest(`/categories/${firstCategory.slug}`);
      if (!categoryResponse.success || !categoryResponse.data) {
        throw new Error('Get category by slug failed');
      }
    }
  }
};

// Test 3: Products API
const testProductsApi = async () => {
  // Test getting all products
  const productsResponse = await apiRequest('/products');
  if (!productsResponse.success || !Array.isArray(productsResponse.data)) {
    throw new Error('Products API did not return expected format');
  }

  // Test featured products
  const featuredResponse = await apiRequest('/products?featured=true');
  if (!featuredResponse.success) {
    throw new Error('Featured products API failed');
  }

  // Test pagination
  const paginatedResponse = await apiRequest('/products?page=1&limit=5');
  if (!paginatedResponse.success || !paginatedResponse.pagination) {
    throw new Error('Product pagination failed');
  }
};

// Test 4: Search Functionality
const testSearchFunctionality = async () => {
  // Test text search
  const searchResponse = await apiRequest('/products?search=phone');
  if (!searchResponse.success) {
    throw new Error('Product search failed');
  }

  // Test category filter
  const categoriesResponse = await apiRequest('/categories');
  if (categoriesResponse.categories.length > 0) {
    const firstCategory = categoriesResponse.categories[0];
    const categoryFilterResponse = await apiRequest(`/products?category=${firstCategory._id}`);
    if (!categoryFilterResponse.success) {
      throw new Error('Category filter failed');
    }
  }
};

// Test 5: Price Filters
const testPriceFilters = async () => {
  // Test price range filtering
  const priceFilterResponse = await apiRequest('/products?minPrice=100000&maxPrice=1000000');
  if (!priceFilterResponse.success) {
    throw new Error('Price filter failed');
  }

  // Test sorting
  const sortedResponse = await apiRequest('/products?sort=price');
  if (!sortedResponse.success) {
    throw new Error('Product sorting failed');
  }
};

// Test 6: Frontend API Integration
const testFrontendIntegration = async () => {
  try {
    // Test if frontend is accessible
    const frontendResponse = await axios.get(FRONTEND_BASE, { timeout: 5000 });
    if (frontendResponse.status !== 200) {
      throw new Error('Frontend is not accessible');
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Frontend not running - skipping frontend integration test');
      return;
    }
    throw error;
  }
};

// Test 7: Error Handling
const testErrorHandling = async () => {
  // Test invalid category ID
  try {
    await apiRequest('/categories/invalid-id');
    throw new Error('Should have returned 400/404 for invalid category ID');
  } catch (error) {
    if (error.status !== 400 && error.status !== 404) {
      throw new Error(`Expected 400/404 for invalid ID, got ${error.status}`);
    }
  }

  // Test invalid product ID
  try {
    await apiRequest('/products/invalid-id');
    throw new Error('Should have returned 400/404 for invalid product ID');
  } catch (error) {
    if (error.status !== 400 && error.status !== 404) {
      throw new Error(`Expected 400/404 for invalid product ID, got ${error.status}`);
    }
  }
};

// Test 8: Data Integrity
const testDataIntegrity = async () => {
  // Check categories have required fields
  const categoriesResponse = await apiRequest('/categories');
  for (const category of categoriesResponse.categories.slice(0, 3)) {
    if (!category.name || !category.slug) {
      throw new Error(`Category missing required fields: ${JSON.stringify(category)}`);
    }
  }

  // Check products have required fields
  const productsResponse = await apiRequest('/products');
  for (const product of productsResponse.data.slice(0, 3)) {
    if (!product.name || product.price === undefined) {
      throw new Error(`Product missing required fields: ${JSON.stringify(product)}`);
    }
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Marketplace Functionality Tests...\n');
  
  // Run all tests
  await runTest('API Health Check', testApiHealth);
  await runTest('Categories API', testCategoriesApi);
  await runTest('Products API', testProductsApi);
  await runTest('Search Functionality', testSearchFunctionality);
  await runTest('Price Filters', testPriceFilters);
  await runTest('Frontend Integration', testFrontendIntegration);
  await runTest('Error Handling', testErrorHandling);
  await runTest('Data Integrity', testDataIntegrity);

  // Print results
  console.log('\n📊 TEST RESULTS:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n🔍 FAILED TESTS DETAILS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Marketplace is ready for launch.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix the issues above.');
  }
};

// Execute tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runAllTests };