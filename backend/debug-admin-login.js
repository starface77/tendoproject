const mongoose = require('mongoose');
const User = require('./models/User');

async function debugAdminLogin() {
  try {
    console.log('🔍 Debugging admin login...');
    
    // Connect to the same database as the backend
    await mongoose.connect('mongodb://localhost:27017/chexoluz', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');
    
    const email = 'admin@tendo.uz';
    
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Try to find the user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      
      // Let's see what users exist in the database
      const allUsers = await User.find({}).select('email role isActive');
      console.log('📋 All users in database:');
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.role}, ${u.isActive ? 'active' : 'inactive'})`);
      });
    } else {
      console.log('✅ User found:');
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Password hash: ${user.password ? user.password.substring(0, 20) + '...' : 'NONE'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugAdminLogin();