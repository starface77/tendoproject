const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function setupTestData() {
  try {
    console.log('🔄 Подключаюсь к MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/tendomarketuz');
    console.log('✅ Подключено к MongoDB');

    // Создаем схемы
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      phone: String,
      role: String,
      isActive: { type: Boolean, default: true },
      isEmailVerified: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    });

    const sellerAppSchema = new mongoose.Schema({
      businessName: String,
      contactName: String,
      email: String,
      phone: String,
      businessType: String,
      address: String,
      status: { type: String, default: 'pending' },
      createdAt: { type: Date, default: Date.now }
    });

    const categorySchema = new mongoose.Schema({
      name: { ru: String, uz: String, en: String },
      slug: String,
      description: { ru: String, uz: String, en: String },
      icon: String,
      isActive: { type: Boolean, default: true },
      isVisible: { type: Boolean, default: true },
      level: { type: Number, default: 0 },
      path: String,
      createdAt: { type: Date, default: Date.now }
    });

    const productSchema = new mongoose.Schema({
      name: String,
      price: Number,
      description: String,
      brand: String,
      model: String,
      images: [String],
      isActive: { type: Boolean, default: true },
      inStock: { type: Boolean, default: true },
      stock: { type: Number, default: 1 },
      createdAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);
    const SellerApplication = mongoose.model('SellerApplication', sellerAppSchema);
    const Category = mongoose.model('Category', categorySchema);
    const Product = mongoose.model('Product', productSchema);

    // Создаем админа
    console.log('👑 Проверяю админа...');
    let admin = await User.findOne({ email: 'admin@market.com' });
    if (!admin) {
      console.log('Создаю админа...');
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      admin = new User({
        email: 'admin@market.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Market',
        phone: '+998901234567',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      await admin.save();
      console.log('✅ Админ создан');
    } else {
      console.log('✅ Админ уже существует');
    }

    // Создаем категорию
    console.log('📂 Проверяю категорию...');
    let category = await Category.findOne({ slug: 'electronics' });
    if (!category) {
      console.log('Создаю категорию...');
      category = new Category({
        name: { ru: 'Электроника', uz: 'Elektronika', en: 'Electronics' },
        slug: 'electronics',
        description: { ru: 'Электроника и гаджеты', uz: 'Elektronika va gadjetlar', en: 'Electronics and gadgets' },
        icon: '📱',
        path: '/electronics'
      });
      await category.save();
      console.log('✅ Категория создана');
    } else {
      console.log('✅ Категория уже существует');
    }

    // Создаем заявку продавца
    console.log('📝 Проверяю заявку продавца...');
    let application = await SellerApplication.findOne({ email: 'seller@test.com' });
    if (!application) {
      console.log('Создаю заявку продавца...');
      application = new SellerApplication({
        businessName: 'Test Electronics Store',
        contactName: 'Иван Иванов',
        email: 'seller@test.com',
        phone: '+998901234567',
        businessType: 'individual',
        address: 'Ташкент, ул. Амира Темура, 15',
        status: 'pending'
      });
      await application.save();
      console.log('✅ Заявка продавца создана');
    } else {
      console.log('✅ Заявка продавца уже существует');
    }

    // Создаем продукт
    console.log('📱 Проверяю продукт...');
    let product = await Product.findOne({ name: 'Test iPhone 15' });
    if (!product) {
      console.log('Создаю продукт...');
      product = new Product({
        name: 'Test iPhone 15',
        price: 1500000,
        description: 'Тестовый iPhone 15 для демонстрации',
        brand: 'Apple',
        model: 'iPhone 15',
        images: ['https://example.com/iphone15.jpg'],
        isActive: true,
        inStock: true,
        stock: 5
      });
      await product.save();
      console.log('✅ Продукт создан');
    } else {
      console.log('✅ Продукт уже существует');
    }

    console.log('\n🎉 Все тестовые данные готовы!');
    console.log('📧 Admin: admin@market.com / admin123456');
    console.log('📝 Заявка продавца ID:', application._id);
    console.log('📂 Категория ID:', category._id);
    console.log('📱 Продукт ID:', product._id);

    await mongoose.disconnect();
    console.log('✅ Отключено от MongoDB');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await mongoose.disconnect();
  }
}

setupTestData();




