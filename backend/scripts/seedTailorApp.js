const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/db');

// Load models
const User = require('../models/User');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Pricing = require('../models/Pricing');
const Expense = require('../models/Expense');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing Tailor Shop app specific collections (Order, Customer, Pricing, Expense)...');
    await Order.deleteMany({});
    await Customer.deleteMany({});
    await Pricing.deleteMany({});
    await Expense.deleteMany({});

    // Ensure Manager exists
    let manager = await User.findOne({ email: 'manager@example.com' });
    if (!manager) {
      manager = await User.create({
        name: 'Manager',
        email: 'manager@example.com',
        password: '123456',
        role: 'manager',
        phone: '0911001122'
      });
      console.log('Created manager: manager@example.com / 123456');
    }

    // Ensure Cutters / Tailors exist
    const cuttersData = [
      { name: 'Abebe Tailor', email: 'abebe@example.com', password: '123456', role: 'cutter', phone: '0933003344' },
      { name: 'Marta Tailor', email: 'marta@example.com', password: '123456', role: 'cutter', phone: '0944004455' }
    ];

    const cutters = [];
    for (const cData of cuttersData) {
      let cutter = await User.findOne({ email: cData.email });
      if (!cutter) {
        cutter = await User.create(cData);
      }
      cutters.push(cutter);
    }
    console.log('Ensured cutter employees exist.');

    // Seed Pricing Structure
    const defaultPricings = [
      { itemType: 'Suit', basePrice: 250, estimatedDays: 7, requiredMeasurements: ['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'length', 'pantLength', 'crotchDepth', 'waistArcFront', 'waistArcBack'] },
      { itemType: 'Shirt', basePrice: 45, estimatedDays: 3, requiredMeasurements: ['chest', 'shoulder', 'sleeves', 'neck', 'length'] },
      { itemType: 'Trousers', basePrice: 60, estimatedDays: 4, requiredMeasurements: ['waist', 'hips', 'inseam', 'pantLength', 'crotchDepth', 'hipDepth', 'bottomWidth'] },
      { itemType: 'Dress', basePrice: 180, estimatedDays: 6, requiredMeasurements: ['chest', 'waist', 'hips', 'shoulder', 'length'] },
      { itemType: 'Coat', basePrice: 300, estimatedDays: 10, requiredMeasurements: ['chest', 'waist', 'shoulder', 'sleeves', 'length'] },
      { itemType: 'Skirt', basePrice: 40, estimatedDays: 2, requiredMeasurements: ['waist', 'hips', 'length'] },
      { itemType: 'Vest', basePrice: 75, estimatedDays: 3, requiredMeasurements: ['chest', 'waist', 'shoulder', 'length'] }
    ];
    await Pricing.insertMany(defaultPricings);
    console.log('Seeded pricing structures.');

    // Standard Measurements for S, M, L
    const defaultCustomers = [
      {
        name: 'Standard Size S (Small)',
        email: 'size.s@example.com',
        phone: '0900000001',
        address: 'Standard Block',
        measurements: { 
          // Trouser / Bottoms
          waist: 76, hips: 94, inseam: 76, pantLength: 100, length: 100, crotchDepth: 24, hipDepth: 18, bottomWidth: 16,
          waistArcFront: 18, waistArcBack: 20, hipArcFront: 22.5, hipArcBack: 24.5,
          // Shirt / Tops
          chest: 96, shoulder: 44, sleeves: 62, neck: 38
        }
      },
      {
        name: 'Standard Size M (Medium)',
        email: 'size.m@example.com',
        phone: '0900000002',
        address: 'Standard Block',
        measurements: { 
          // Trouser / Bottoms
          waist: 86, hips: 104, inseam: 81, pantLength: 105, length: 105, crotchDepth: 26, hipDepth: 20, bottomWidth: 18,
          waistArcFront: 20.5, waistArcBack: 22.5, hipArcFront: 25, hipArcBack: 27,
          // Shirt / Tops
          chest: 104, shoulder: 46, sleeves: 64, neck: 40
        }
      },
      {
        name: 'Standard Size L (Large)',
        email: 'size.l@example.com',
        phone: '0900000003',
        address: 'Standard Block',
        measurements: { 
          // Trouser / Bottoms
          waist: 96, hips: 114, inseam: 86, pantLength: 110, length: 110, crotchDepth: 28, hipDepth: 22, bottomWidth: 20,
          waistArcFront: 23, waistArcBack: 25, hipArcFront: 27.5, hipArcBack: 29.5,
          // Shirt / Tops
          chest: 112, shoulder: 48, sleeves: 66, neck: 42
        }
      }
    ];
    const customers = await Customer.insertMany(defaultCustomers);
    console.log('Seeded standard Size S, M, L customers.');

    const today = new Date();
    const futureDate = (days) => {
      const d = new Date();
      d.setDate(today.getDate() + days);
      return d;
    };

    const ordersData = [
      {
        orderNumber: 'ORD-SIZE-S',
        customer: customers[0]._id,
        items: [
          { itemType: 'Trousers', quantity: 1, price: 60, notes: 'Small Trouser Pattern' },
          { itemType: 'Shirt', quantity: 1, price: 45, notes: 'Small Shirt Pattern' },
          { itemType: 'Vest', quantity: 1, price: 75, notes: 'Small Vest Pattern' }
        ],
        totalAmount: 180,
        amountPaid: 180,
        paymentStatus: 'fully_paid',
        status: 'cutting',
        assignedTo: cutters[0]._id,
        dueDate: futureDate(2),
        payments: []
      },
      {
        orderNumber: 'ORD-SIZE-M',
        customer: customers[1]._id,
        items: [
          { itemType: 'Trousers', quantity: 1, price: 60, notes: 'Medium Trouser Pattern' },
          { itemType: 'Coat', quantity: 1, price: 300, notes: 'Medium Coat Pattern' },
          { itemType: 'Skirt', quantity: 2, price: 80, notes: 'Medium Skirt Pattern' }
        ],
        totalAmount: 440,
        amountPaid: 0,
        paymentStatus: 'unpaid',
        status: 'cutting',
        assignedTo: cutters[1]._id,
        dueDate: futureDate(5),
        payments: []
      },
      {
        orderNumber: 'ORD-SIZE-L',
        customer: customers[2]._id,
        items: [
          { itemType: 'Trousers', quantity: 1, price: 60, notes: 'Large Trouser Pattern' },
          { itemType: 'Suit', quantity: 1, price: 250, notes: 'Large Suit Pattern' }
        ],
        totalAmount: 310,
        amountPaid: 0,
        paymentStatus: 'unpaid',
        status: 'cutting',
        assignedTo: cutters[0]._id,
        dueDate: futureDate(7),
        payments: []
      }
    ];

    await Order.insertMany(ordersData);
    console.log('Seeded orders for S, M, L tests.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
