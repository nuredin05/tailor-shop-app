const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const email = 'superadmin@example.com';
    const password = 'superpassword123'; // The User model will hash this in pre-save hook

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
