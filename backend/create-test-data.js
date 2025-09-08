const { connectDB } = require('./config/database');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Category = require('./models/Category');

const createTestData = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    console.log('🧹 Clearing old test data...');
    await User.deleteMany({ email: { $regex: 'test@' } });
    await Product.deleteMany({ name: { $regex: 'Test ' } });
    await Order.deleteMany({ orderNumber: { $regex: 'TEST-' } });
    await Category.deleteMany({ name: { $regex: 'Test ' } });

    console.log('📦 Creating test categories...');
    const categories = await Category.create([
      { name: { ru: 'Смартфоны', uz: 'Smartfonlar', en: 'Smartphones' }, slug: 'smartphones' },
      { name: { ru: 'Чехлы', uz: 'Chexollar', en: 'Cases' }, slug: 'cases' },
      { name: { ru: 'Аксессуары', uz: 'Aksessuarlar', en: 'Accessories' }, slug: 'accessories' }
    ]);

    console.log('📱 Creating test products...');
    const products = await Product.create([
      {
        name: { ru: 'iPhone 15 Pro чехол', uz: 'iPhone 15 Pro chexol', en: 'iPhone 15 Pro Case' },
        description: { ru: 'Защитный чехол для iPhone 15 Pro', uz: 'iPhone 15 Pro uchun himoya chexoli', en: 'Protective case for iPhone 15 Pro' },
        price: 29990,
        category: categories[1]._id,
        images: ['https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400'],
        isActive: true,
        stock: 15,
        sku: 'IPH15P-CASE-001'
      },
      {
        name: { ru: 'Samsung Galaxy S24 чехол', uz: 'Samsung Galaxy S24 chexol', en: 'Samsung Galaxy S24 Case' },
        description: { ru: 'Защитный чехол для Samsung Galaxy S24', uz: 'Samsung Galaxy S24 uchun himoya chexoli', en: 'Protective case for Samsung Galaxy S24' },
        price: 25990,
        category: categories[1]._id,
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'],
        isActive: true,
        stock: 8,
        sku: 'SGS24-CASE-002'
      },
      {
        name: { ru: 'Защитное стекло iPhone', uz: 'iPhone uchun himoya oynasi', en: 'iPhone Screen Protector' },
        description: { ru: 'Защитное стекло для экрана iPhone', uz: 'iPhone ekranini himoya qiluvchi oynasi', en: 'Screen protector for iPhone' },
        price: 12990,
        category: categories[2]._id,
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
        isActive: true,
        stock: 25,
        sku: 'SCREEN-PROTECT-003'
      }
    ]);

    console.log('👤 Creating test users...');
    const users = await User.create([
      {
        email: 'test1@example.com',
        password: 'password123',
        firstName: 'Алексей',
        lastName: 'Иванов',
        phone: '+998901234567',
        city: 'tashkent',
        role: 'user',
        isActive: true,
        isEmailVerified: true
      },
      {
        email: 'test2@example.com',
        password: 'password123',
        firstName: 'Мария',
        lastName: 'Петрова',
        phone: '+998902468135',
        city: 'samarkand',
        role: 'user',
        isActive: true,
        isEmailVerified: true
      }
    ]);

    console.log('🛒 Creating test orders...');
    const orders = await Order.create([
      {
        customer: users[0]._id,
        items: [{
          product: products[0]._id,
          quantity: 1,
          price: products[0].price
        }],
        pricing: {
          subtotal: products[0].price,
          delivery: 5000,
          total: products[0].price + 5000
        },
        payment: {
          method: 'click',
          status: 'paid'
        },
        shipping: {
          address: 'ул. Ленина 123',
          city: 'tashkent',
          phone: users[0].phone
        },
        status: 'shipped',
        orderNumber: 'TEST-001'
      },
      {
        customer: users[1]._id,
        items: [{
          product: products[1]._id,
          quantity: 2,
          price: products[1].price
        }],
        pricing: {
          subtotal: products[1].price * 2,
          delivery: 8000,
          total: products[1].price * 2 + 8000
        },
        payment: {
          method: 'payme',
          status: 'paid'
        },
        shipping: {
          address: 'пр. Навои 45',
          city: 'samarkand',
          phone: users[1].phone
        },
        status: 'processing',
        orderNumber: 'TEST-002'
      },
      {
        customer: users[0]._id,
        items: [{
          product: products[2]._id,
          quantity: 1,
          price: products[2].price
        }],
        pricing: {
          subtotal: products[2].price,
          delivery: 3000,
          total: products[2].price + 3000
        },
        payment: {
          method: 'uzcard',
          status: 'pending'
        },
        shipping: {
          address: 'ул. Пушкина 78',
          city: 'tashkent',
          phone: users[0].phone
        },
        status: 'pending',
        orderNumber: 'TEST-003'
      }
    ]);

    console.log('✅ Test data created successfully!');
    console.log(`📊 Created:`);
    console.log(`   ${categories.length} categories`);
    console.log(`   ${products.length} products`);
    console.log(`   ${users.length} users`);
    console.log(`   ${orders.length} orders`);

    console.log('\n🔐 Admin login:');
    console.log('📧 Email: admin@tendo.com');
    console.log('🔐 Password: admin123456');

  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
};

createTestData();










