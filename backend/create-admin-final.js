require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  try {
    await mongoose.connect('mongodb://localhost:27017/tendo-market');
    console.log('Connected to MongoDB');
    
    // Delete all admins
    await mongoose.connection.db.collection('users').deleteMany({ role: 'admin' });
    console.log('Deleted all admins');
    
    // Create hash
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Hash created');
    
    // Insert admin directly
    const result = await mongoose.connection.db.collection('users').insertOne({
      firstName: 'Admin',
      lastName: 'Super', 
      email: 'admin@tendo.uz',
      password: hash,
      role: 'admin',
      isActive: true,
      isVerified: true,
      language: 'ru',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Admin created with ID:', result.insertedId.toString());
    
    // Test the admin
    const admin = await mongoose.connection.db.collection('users').findOne({ _id: result.insertedId });
    console.log('Email:', admin.email);
    console.log('Password hash exists:', !!admin.password);
    
    const test = await bcrypt.compare('admin123', admin.password);
    console.log('PASSWORD TEST RESULT:', test);
    
    if (test) {
      console.log('');
      console.log('SUCCESS! Use these credentials:');
      console.log('Email: admin@tendo.uz');
      console.log('Password: admin123');
      console.log('');
    } else {
      console.log('FAILED!');
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();







