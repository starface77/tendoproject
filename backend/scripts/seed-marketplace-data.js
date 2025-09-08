/**
 * 🌱 SEED MARKETPLACE DATA
 * Create realistic test data for admin dashboard
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');

// Models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Promotion = require('../models/Promotion');
const Payout = require('../models/Payout');
const Support = require('../models/Support');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Order.deleteMany({}),
      Promotion.deleteMany({}),
      Payout.deleteMany({}),
      Support.deleteMany({})
    ]);

    // Create categories
    console.log('📂 Creating categories...');
    const categories = await Category.insertMany([
      { name: { ru: 'Смартфоны и аксессуары', uz: 'Smartfonlar va aksessuarlar' }, slug: 'smartphones' },
      { name: { ru: 'Ноутбуки и компьютеры', uz: 'Noutbuklar va kompyuterlar' }, slug: 'laptops' },
      { name: { ru: 'Наушники и аудио', uz: 'Quloqchinlar va audio' }, slug: 'headphones' },
      { name: { ru: 'Смарт-часы', uz: 'Smart-soatlar' }, slug: 'smartwatches' },
      { name: { ru: 'Планшеты', uz: 'Planshetlar' }, slug: 'tablets' },
      { name: { ru: 'Игровые консоли', uz: 'O\'yin konsollari' }, slug: 'gaming' }
    ]);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      email: 'admin@tendo.market',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: admin123
      firstName: 'Admin',
      lastName: 'Tendo',
      role: 'admin',
      isActive: true,
      phone: '+998901234567'
    });

    // Create test customers
    console.log('👥 Creating test customers...');
    const customers = await User.insertMany([
      {
        email: 'john.doe@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
        phone: '+998901234568'
      },
      {
        email: 'jane.smith@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
        isActive: true,
        phone: '+998901234569'
      },
      {
        email: 'bob.johnson@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: 'user',
        isActive: true,
        phone: '+998901234570'
      },
      {
        email: 'alice.wilson@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        firstName: 'Alice',
        lastName: 'Wilson',
        role: 'user',
        isActive: true,
        phone: '+998901234571'
      },
      {
        email: 'david.brown@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        firstName: 'David',
        lastName: 'Brown',
        role: 'user',
        isActive: false,
        phone: '+998901234572'
      }
    ]);

    // Create test sellers
    console.log('🏪 Creating test sellers...');
    const sellers = await User.insertMany([
      {
        email: 'seller1@tendo.market',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        firstName: 'Tech',
        lastName: 'Store',
        role: 'seller',
        isActive: true,
        phone: '+998901234573'
      },
      {
        email: 'seller2@tendo.market',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        firstName: 'Gadget',
        lastName: 'Hub',
        role: 'seller',
        isActive: true,
        phone: '+998901234574'
      }
    ]);

    // Create products
    console.log('📦 Creating products...');
    const products = await Product.insertMany([
      {
        name: {
          ru: 'iPhone 15 Pro Max',
          uz: 'iPhone 15 Pro Max'
        },
        description: {
          ru: 'Флагманский смартфон Apple с новейшими технологиями',
          uz: 'Apple\'ning eng yangi texnologiyalari bilan jihozlangan flagman smartfoni'
        },
        price: 1299,
        category: categories[0]._id,
        seller: sellers[0]._id,
        images: ['/uploads/products/iphone15.jpg'],
        stock: 50,
        isActive: true,
        status: 'active',
        specifications: {
          'Экран': '6.7" Super Retina XDR',
          'Процессор': 'A17 Pro',
          'Память': '256GB',
          'Камера': '48MP'
        },
        purchases: 25
      },
      {
        name: {
          ru: 'MacBook Pro 16"',
          uz: 'MacBook Pro 16"'
        },
        description: {
          ru: 'Мощный ноутбук для профессионалов',
          uz: 'Professional uchun kuchli noutbuk'
        },
        price: 2499,
        category: categories[1]._id,
        seller: sellers[1]._id,
        images: ['/uploads/products/macbook.jpg'],
        stock: 20,
        isActive: true,
        status: 'active',
        specifications: {
          'Экран': '16.2" Liquid Retina XDR',
          'Процессор': 'M3 Max',
          'Память': '32GB',
          'SSD': '1TB'
        },
        purchases: 15
      },
      {
        name: {
          ru: 'AirPods Pro 2',
          uz: 'AirPods Pro 2'
        },
        description: {
          ru: 'Беспроводные наушники с активным шумоподавлением',
          uz: 'Aktiv shovqinni bekor qilish bilan simsiz quloqchinlar'
        },
        price: 249,
        category: categories[2]._id,
        seller: sellers[0]._id,
        images: ['/uploads/products/airpods.jpg'],
        stock: 100,
        isActive: true,
        status: 'active',
        specifications: {
          'Тип': 'Беспроводные',
          'Время работы': '30 часов',
          'Шумоподавление': 'Активное'
        },
        purchases: 45
      },
      {
        name: {
          ru: 'Apple Watch Series 9',
          uz: 'Apple Watch Series 9'
        },
        description: {
          ru: 'Умные часы с новыми функциями здоровья',
          uz: 'Salomatlikning yangi funksiyalari bilan smart-soat'
        },
        price: 399,
        category: categories[3]._id,
        seller: sellers[1]._id,
        images: ['/uploads/products/watch.jpg'],
        stock: 30,
        isActive: true,
        status: 'active',
        specifications: {
          'Экран': '45mm Retina',
          'Процессор': 'S9 SiP',
          'Водонепроницаемость': '50м'
        },
        purchases: 20
      },
      {
        name: {
          ru: 'iPad Pro 12.9"',
          uz: 'iPad Pro 12.9"'
        },
        description: {
          ru: 'Профессиональный планшет для творчества',
          uz: 'Ijod uchun professional planshet'
        },
        price: 1099,
        category: categories[4]._id,
        seller: sellers[0]._id,
        images: ['/uploads/products/ipad.jpg'],
        stock: 15,
        isActive: true,
        status: 'active',
        specifications: {
          'Экран': '12.9" Liquid Retina XDR',
          'Процессор': 'M2',
          'Память': '256GB'
        },
        purchases: 12
      }
    ]);

    // Create orders
    console.log('📋 Creating orders...');
    const orders = await Order.insertMany([
      {
        customer: customers[0]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            price: products[0].price
          }
        ],
        pricing: {
          subtotal: products[0].price,
          tax: products[0].price * 0.12,
          shipping: 0,
          total: products[0].price * 1.12
        },
        payment: {
          method: 'card',
          status: 'paid',
          transactionId: 'txn_1234567890'
        },
        shipping: {
          address: '123 Main St, Tashkent',
          method: 'standard'
        },
        status: 'completed',
        orderNumber: 'ORD-001'
      },
      {
        customer: customers[1]._id,
        items: [
          {
            product: products[1]._id,
            quantity: 1,
            price: products[1].price
          },
          {
            product: products[2]._id,
            quantity: 2,
            price: products[2].price
          }
        ],
        pricing: {
          subtotal: products[1].price + (products[2].price * 2),
          tax: (products[1].price + (products[2].price * 2)) * 0.12,
          shipping: 0,
          total: (products[1].price + (products[2].price * 2)) * 1.12
        },
        payment: {
          method: 'card',
          status: 'paid',
          transactionId: 'txn_1234567891'
        },
        shipping: {
          address: '456 Oak Ave, Tashkent',
          method: 'express'
        },
        status: 'processing',
        orderNumber: 'ORD-002'
      },
      {
        customer: customers[2]._id,
        items: [
          {
            product: products[3]._id,
            quantity: 1,
            price: products[3].price
          }
        ],
        pricing: {
          subtotal: products[3].price,
          tax: products[3].price * 0.12,
          shipping: 0,
          total: products[3].price * 1.12
        },
        payment: {
          method: 'cash',
          status: 'paid',
          transactionId: 'txn_1234567892'
        },
        shipping: {
          address: '789 Pine St, Tashkent',
          method: 'pickup'
        },
        status: 'shipped',
        orderNumber: 'ORD-003'
      },
      {
        customer: customers[3]._id,
        items: [
          {
            product: products[4]._id,
            quantity: 1,
            price: products[4].price
          }
        ],
        pricing: {
          subtotal: products[4].price,
          tax: products[4].price * 0.12,
          shipping: 0,
          total: products[4].price * 1.12
        },
        payment: {
          method: 'card',
          status: 'pending',
          transactionId: 'txn_1234567893'
        },
        shipping: {
          address: '321 Elm St, Tashkent',
          method: 'standard'
        },
        status: 'pending',
        orderNumber: 'ORD-004'
      }
    ]);

    // Create promotions
    console.log('🎯 Creating promotions...');
    const promotions = await Promotion.insertMany([
      {
        title: 'Back to School Sale',
        description: 'Special discount for students and educators',
        discountType: 'percentage',
        discountValue: 15,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active',
        applicableProducts: [products[0]._id, products[1]._id],
        applicableCategories: [],
        usageLimit: 100,
        usageCount: 5,
        minimumOrderValue: 500,
        createdBy: adminUser._id
      },
      {
        title: 'Weekend Flash Sale',
        description: 'Limited time offer on selected products',
        discountType: 'fixed',
        discountValue: 50,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'scheduled',
        applicableProducts: [],
        applicableCategories: [categories[2]._id],
        usageLimit: 50,
        usageCount: 0,
        minimumOrderValue: 100,
        createdBy: adminUser._id
      }
    ]);

    // Create payouts
    console.log('💰 Creating payouts...');
    const payouts = await Payout.insertMany([
      {
        seller: sellers[0]._id,
        amount: 1500,
        currency: 'UZS',
        status: 'completed',
        paymentMethod: 'bank_transfer',
        orders: [orders[0]._id],
        commission: 150,
        netAmount: 1350,
        processedBy: adminUser._id,
        processedAt: new Date(),
        description: 'Payment for completed orders'
      },
      {
        seller: sellers[1]._id,
        amount: 2800,
        currency: 'UZS',
        status: 'pending',
        paymentMethod: 'card',
        orders: [orders[1]._id, orders[2]._id],
        commission: 280,
        netAmount: 2520,
        description: 'Payment for recent orders'
      }
    ]);

    // Create support tickets
    console.log('🎫 Creating support tickets...');
    const supportTickets = await Support.insertMany([
      {
        customer: customers[0]._id,
        subject: 'Order delivery delay',
        description: 'My order ORD-001 has been delayed for 3 days',
        category: 'order',
        priority: 'medium',
        status: 'open',
        assignedTo: adminUser._id,
        messages: [
          {
            sender: customers[0]._id,
            senderType: 'user',
            message: 'Hello, my order ORD-001 is showing as completed but I haven\'t received it yet.',
            isRead: true
          },
          {
            sender: adminUser._id,
            senderType: 'admin',
            message: 'Thank you for reaching out. We\'re investigating the delay and will update you soon.',
            isRead: false
          }
        ]
      },
      {
        customer: customers[1]._id,
        subject: 'Refund request',
        description: 'Product received was damaged, requesting refund',
        category: 'order',
        priority: 'high',
        status: 'in_progress',
        assignedTo: adminUser._id,
        messages: [
          {
            sender: customers[1]._id,
            senderType: 'user',
            message: 'The product I received is damaged. I would like to request a refund.',
            isRead: true
          }
        ]
      },
      {
        customer: customers[2]._id,
        subject: 'Account verification issue',
        description: 'Unable to verify my account for seller registration',
        category: 'account',
        priority: 'low',
        status: 'resolved',
        assignedTo: adminUser._id,
        resolution: 'Account verification completed successfully',
        messages: [
          {
            sender: customers[2]._id,
            senderType: 'user',
            message: 'I\'m having trouble verifying my account to become a seller.',
            isRead: true
          },
          {
            sender: adminUser._id,
            senderType: 'admin',
            message: 'Your account has been verified. You can now access seller features.',
            isRead: true
          }
        ]
      }
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${categories.length} categories created`);
    console.log(`   - ${customers.length + sellers.length + 1} users created (${customers.length} customers, ${sellers.length} sellers, 1 admin)`);
    console.log(`   - ${products.length} products created`);
    console.log(`   - ${orders.length} orders created`);
    console.log(`   - ${promotions.length} promotions created`);
    console.log(`   - ${payouts.length} payouts created`);
    console.log(`   - ${supportTickets.length} support tickets created`);

    console.log('\n🔐 Admin login:');
    console.log('   Email: admin@tendo.market');
    console.log('   Password: admin123');

    console.log('\n👥 Test customers:');
    customers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.firstName} ${customer.lastName} - ${customer.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();




