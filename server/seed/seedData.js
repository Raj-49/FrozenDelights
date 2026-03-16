const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create admin user (password will be hashed by pre-save hook)
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@frozen.com',
      password: 'Admin@123', // Plain text - will be hashed by pre-save hook
      role: 'admin',
      authProvider: 'local',
      isEmailVerified: true
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create ice cream products with placeholder images from picsum.photos
    const products = [
      {
        name: 'Mango Delight',
        category: 'cone',
        flavor: 'Mango',
        size: 'medium',
        price: 60,
        stock: 25,
        available: true,
        image: 'https://picsum.photos/seed/mango/400/400'
      },
      {
        name: 'Choco Blast',
        category: 'cup',
        flavor: 'Chocolate',
        size: 'large',
        price: 80,
        stock: 15,
        available: true,
        image: 'https://picsum.photos/seed/choco/400/400'
      },
      {
        name: 'Strawberry Swirl',
        category: 'cone',
        flavor: 'Strawberry',
        size: 'small',
        price: 40,
        stock: 30,
        available: true,
        image: 'https://picsum.photos/seed/strawberry/400/400'
      },
      {
        name: 'Family Vanilla Pack',
        category: 'family pack',
        flavor: 'Vanilla',
        size: 'large',
        price: 220,
        stock: 8,
        available: true,
        image: 'https://picsum.photos/seed/vanilla/400/400'
      },
      {
        name: 'Rainbow Combo',
        category: 'combo',
        flavor: 'Mixed',
        size: 'medium',
        price: 150,
        stock: 12,
        available: true,
        image: 'https://picsum.photos/seed/rainbow/400/400'
      },
      {
        name: 'Butterscotch Cup',
        category: 'cup',
        flavor: 'Butterscotch',
        size: 'medium',
        price: 70,
        stock: 20,
        available: true,
        image: 'https://picsum.photos/seed/butterscotch/400/400'
      }
    ];

    await Product.insertMany(products);
    console.log('Products seeded successfully');

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
