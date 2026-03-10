const mongoose = require('mongoose');
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

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@frozen.com',
      password: 'Admin@123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create ice cream products
    const products = [
      {
        name: 'Vanilla Cone',
        category: 'cone',
        flavor: 'Vanilla',
        size: 'small',
        price: 50,
        stock: 100,
        image: 'vanilla-cone.jpg'
      },
      {
        name: 'Chocolate Cup',
        category: 'cup',
        flavor: 'Chocolate',
        size: 'medium',
        price: 80,
        stock: 75,
        image: 'chocolate-cup.jpg'
      },
      {
        name: 'Strawberry Family Pack',
        category: 'family pack',
        flavor: 'Strawberry',
        size: 'large',
        price: 250,
        stock: 30,
        image: 'strawberry-family.jpg'
      },
      {
        name: 'Mango Combo',
        category: 'combo',
        flavor: 'Mango',
        size: 'medium',
        price: 150,
        stock: 50,
        image: 'mango-combo.jpg'
      },
      {
        name: 'Butterscotch Cone',
        category: 'cone',
        flavor: 'Butterscotch',
        size: 'small',
        price: 60,
        stock: 80,
        image: 'butterscotch-cone.jpg'
      },
      {
        name: 'Mint Chocolate Cup',
        category: 'cup',
        flavor: 'Mint Chocolate',
        size: 'large',
        price: 120,
        stock: 40,
        image: 'mint-chocolate-cup.jpg'
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
