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
        name: 'nuru Manager',
        email: 'manager@example.com',
        password: '123456',
        role: 'manager',
        phone: '0911001122'
      });
      console.log('Created manager: manager@example.com / 123456');
    }

    // Ensure Officer exists
    let officer = await User.findOne({ email: 'officer@example.com' });
    if (!officer) {
      officer = await User.create({
        name: 'Sarah Officer',
        email: 'officer@example.com',
        password: '123456',
        role: 'officer',
        phone: '0922002233'
      });
      console.log('Created officer: officer@example.com / 123456');
    }

    // Ensure Cutters / Tailors exist
    const cuttersData = [
      { name: 'Abebe Tailor', email: 'abebe@example.com', password: '123456', role: 'cutter', phone: '0933003344' },
      { name: 'Marta Tailor', email: 'marta@example.com', password: '123456', role: 'cutter', phone: '0944004455' },
      { name: 'Kassa Tailor', email: 'kassa@example.com', password: '123456', role: 'cutter', phone: '0955005566' }
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

    // Ensure Mock Client User exists
    let clientUser = await User.findOne({ email: 'michael@dundermifflin.com' });
    if (!clientUser) {
      clientUser = await User.create({
        name: 'Michael Scott',
        email: 'michael@dundermifflin.com',
        password: '123456',
        role: 'customer',
        phone: '0912121212'
      });
      console.log('Created mock client: michael@dundermifflin.com / 123456');
    }

    // Seed Pricing Structure
    const defaultPricings = [
      {
        itemType: 'Suit',
        basePrice: 250,
        estimatedDays: 7,
        requiredMeasurements: ['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'neck', 'length']
      },
      {
        itemType: 'Shirt',
        basePrice: 45,
        estimatedDays: 3,
        requiredMeasurements: ['chest', 'shoulder', 'sleeves', 'neck', 'length']
      },
      {
        itemType: 'Trousers',
        basePrice: 60,
        estimatedDays: 4,
        requiredMeasurements: ['waist', 'hips', 'inseam', 'length']
      },
      {
        itemType: 'Dress',
        basePrice: 180,
        estimatedDays: 6,
        requiredMeasurements: ['chest', 'waist', 'hips', 'shoulder', 'length']
      },
      {
        itemType: 'Coat',
        basePrice: 300,
        estimatedDays: 10,
        requiredMeasurements: ['chest', 'waist', 'shoulder', 'sleeves', 'length']
      }
    ];
    const pricings = await Pricing.insertMany(defaultPricings);
    console.log('Seeded pricing structures.');

    // Seed Customers
    const defaultCustomers = [
      {
        name: 'Michael Scott',
        email: 'michael@dundermifflin.com',
        phone: '0912121212',
        address: 'Scranton, PA',
        measurements: { chest: 42, waist: 38, hips: 40, shoulder: 18, sleeves: 25, inseam: 30, neck: 16, length: 31 }
      },
      {
        name: 'Dwight Schrute',
        email: 'dwight@beetfarm.com',
        phone: '0913131313',
        address: 'Beet Farm, PA',
        measurements: { chest: 40, waist: 34, hips: 38, shoulder: 17, sleeves: 24, inseam: 32, neck: 15, length: 30 }
      },
      {
        name: 'Jim Halpert',
        email: 'jim@dundermifflin.com',
        phone: '0914141414',
        address: 'Philly, PA',
        measurements: { chest: 38, waist: 32, hips: 37, shoulder: 18, sleeves: 26, inseam: 34, neck: 15.5, length: 32 }
      },
      {
        name: 'Pam Beesly',
        email: 'pam@dundermifflin.com',
        phone: '0915151515',
        address: 'Scranton, PA',
        measurements: { chest: 34, waist: 28, hips: 36, shoulder: 15, sleeves: 22, inseam: 29, neck: 13, length: 26 }
      }
    ];
    const customers = await Customer.insertMany(defaultCustomers);
    console.log('Seeded customers.');

    // Seed Orders (Active, Overdue/Bottlenecks, Completed)
    const today = new Date();
    const pastDate = (days) => {
      const d = new Date();
      d.setDate(today.getDate() - days);
      return d;
    };
    const futureDate = (days) => {
      const d = new Date();
      d.setDate(today.getDate() + days);
      return d;
    };

    const ordersData = [
      {
        orderNumber: 'ORD-1001',
        customer: customers[0]._id,
        items: [{ itemType: 'Suit', quantity: 1, price: 250, notes: 'Blue classic fit' }],
        totalAmount: 250,
        amountPaid: 250,
        paymentStatus: 'fully_paid',
        status: 'delivered',
        assignedTo: cutters[0]._id,
        dueDate: pastDate(2),
        payments: [{ amount: 250, method: 'card', receiptNumber: 'REC-2001', date: pastDate(5) }],
        notes: 'Needs matching tie.'
      },
      {
        orderNumber: 'ORD-1002',
        customer: customers[1]._id,
        items: [{ itemType: 'Trousers', quantity: 2, price: 120, notes: 'Mustard yellow' }],
        totalAmount: 120,
        amountPaid: 60,
        paymentStatus: 'partially_paid',
        status: 'sewing',
        assignedTo: cutters[1]._id,
        dueDate: pastDate(3), // OVERDUE & stuck in sewing => active bottleneck!
        payments: [{ amount: 60, method: 'cash', receiptNumber: 'REC-2002', date: pastDate(5) }],
        notes: 'Extra pockets.'
      },
      {
        orderNumber: 'ORD-1003',
        customer: customers[2]._id,
        items: [{ itemType: 'Shirt', quantity: 3, price: 135, notes: 'White dress shirts' }],
        totalAmount: 135,
        amountPaid: 135,
        paymentStatus: 'fully_paid',
        status: 'completed',
        assignedTo: cutters[0]._id,
        dueDate: pastDate(1),
        payments: [{ amount: 135, method: 'transfer', receiptNumber: 'REC-2003', date: pastDate(2) }]
      },
      {
        orderNumber: 'ORD-1004',
        customer: customers[3]._id,
        items: [{ itemType: 'Dress', quantity: 1, price: 180, notes: 'Wedding guest dress' }],
        totalAmount: 180,
        amountPaid: 0,
        paymentStatus: 'unpaid',
        status: 'cutting',
        assignedTo: cutters[2]._id,
        dueDate: futureDate(4),
        payments: []
      },
      {
        orderNumber: 'ORD-1005',
        customer: customers[0]._id,
        items: [{ itemType: 'Coat', quantity: 1, price: 300, notes: 'Heavy wool winter coat' }],
        totalAmount: 300,
        amountPaid: 150,
        paymentStatus: 'partially_paid',
        status: 'pending',
        assignedTo: cutters[1]._id,
        dueDate: futureDate(8),
        payments: [{ amount: 150, method: 'mobile_money', receiptNumber: 'REC-2004', date: today }]
      }
    ];

    await Order.insertMany(ordersData);
    console.log('Seeded orders.');

    // Seed Expenses (including payroll costs for cutters)
    const expensesData = [
      { description: 'Monthly rent for shop space', amount: 500, category: 'rent', date: pastDate(15) },
      { description: 'Electric and water utilities', amount: 120, category: 'utilities', date: pastDate(10) },
      { description: 'Premium wool and silk fabric roll', amount: 350, category: 'materials', date: pastDate(12) },
      { description: 'Payroll: Abebe Tailor (Cutter)', amount: 300, category: 'payroll', date: pastDate(5), employee: cutters[0]._id },
      { description: 'Payroll: Marta Tailor (Cutter)', amount: 280, category: 'payroll', date: pastDate(5), employee: cutters[1]._id },
      { description: 'Payroll: Kassa Tailor (Cutter)', amount: 280, category: 'payroll', date: pastDate(5), employee: cutters[2]._id }
    ];
    await Expense.insertMany(expensesData);
    console.log('Seeded expenses & payroll costs.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
