const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

const path = require('path');

// Load env vars from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const email = 'superadmin@example.com';
    const password = '123456'; // The User model will hash this in pre-save hook

    const adminExists = await User.findOne({ role: 'superadmin' });

    if (adminExists) {
      console.log('Super Admin already exists');
      process.exit();
    }

    const superAdmin = await User.create({
      name: 'Super Admin',
      email,
      password,
      role: 'superadmin',
    });

    console.log('Super Admin created successfully:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedSuperAdmin();
