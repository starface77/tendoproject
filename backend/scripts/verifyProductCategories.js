/**
 * 🔍 SCRIPT TO VERIFY PRODUCT-CATEGORY CONNECTIONS
 * Cleans up dead records and ensures data integrity
 */

const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/marketplace', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Main verification function
const verifyProductCategories = async () => {
  try {
    console.log('🔍 Starting product-category verification...');

    // 1. Find all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);

    // 2. Check for products with invalid category references
    let invalidProducts = 0;
    let fixedProducts = 0;
    
    for (const product of products) {
      if (product.category) {
        // Check if category exists
        const categoryExists = await Category.findById(product.category);
        if (!categoryExists) {
          console.log(`❌ Product "${product.name}" has invalid category: ${product.category}`);
          invalidProducts++;
          
          // Remove the invalid category reference
          product.category = null;
          await product.save();
          fixedProducts++;
        }
      }
    }

    // 3. Find categories with incorrect product counts
    const categories = await Category.find({});
    console.log(`📂 Found ${categories.length} categories`);

    let updatedCategoryCount = 0;
    for (const category of categories) {
      // Count actual products in this category
      const actualProductCount = await Product.countDocuments({
        category: category._id,
        isActive: true
      });

      if (category.productCount !== actualProductCount) {
        console.log(`📊 Updating category "${category.name.ru}" product count: ${category.productCount} → ${actualProductCount}`);
        category.productCount = actualProductCount;
        await category.save();
        updatedCategoryCount++;
      }
    }

    // 4. Find and remove orphaned products (products without valid categories)
    const orphanedProducts = await Product.find({
      $or: [
        { category: null },
        { category: { $exists: false } }
      ]
    });

    console.log(`🧹 Found ${orphanedProducts.length} orphaned products (without categories)`);

    // 5. Check for duplicate products
    const duplicateCheck = await Product.aggregate([
      {
        $group: {
          _id: { name: '$name', category: '$category' },
          count: { $sum: 1 },
          docs: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`🔄 Found ${duplicateCheck.length} potential duplicate product groups`);

    // 6. Summary
    console.log('\n📋 VERIFICATION SUMMARY:');
    console.log(`   Products checked: ${products.length}`);
    console.log(`   Invalid category references: ${invalidProducts}`);
    console.log(`   Products fixed: ${fixedProducts}`);
    console.log(`   Categories updated: ${updatedCategoryCount}`);
    console.log(`   Orphaned products: ${orphanedProducts.length}`);
    console.log(`   Potential duplicates: ${duplicateCheck.length}`);

    if (invalidProducts === 0 && updatedCategoryCount === 0 && orphanedProducts.length === 0) {
      console.log('✅ All product-category connections are valid!');
    } else {
      console.log('⚠️  Issues found and fixed. Database cleaned up.');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
};

// Clean up old demo/test products
const removeTestProducts = async () => {
  try {
    console.log('\n🧹 Removing test/demo products...');

    const testPatterns = [
      /test/i,
      /demo/i,
      /sample/i,
      /fake/i,
      /placeholder/i,
      /iPhone 15/i,
      /Samsung Galaxy/i,
      /MacBook/i
    ];

    let removedCount = 0;
    for (const pattern of testPatterns) {
      const result = await Product.deleteMany({ name: pattern });
      removedCount += result.deletedCount;
    }

    console.log(`🗑️  Removed ${removedCount} test/demo products`);

  } catch (error) {
    console.error('❌ Error removing test products:', error);
  }
};

// Run the verification
const run = async () => {
  await connectDB();
  await verifyProductCategories();
  await removeTestProducts();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Execute if called directly
if (require.main === module) {
  run().catch(console.error);
}

module.exports = { verifyProductCategories, removeTestProducts };