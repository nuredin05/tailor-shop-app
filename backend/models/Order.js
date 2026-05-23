const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    items: [
      {
        itemType: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        notes: String
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    amountPaid: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'fully_paid'],
      default: 'unpaid'
    },
    status: {
      type: String,
      enum: ['pending', 'cutting', 'sewing', 'fitting', 'completed', 'delivered'],
      default: 'pending'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: {
      type: Date,
      required: true
    },
    payments: [
      {
        amount: { type: Number, required: true },
        method: {
          type: String,
          enum: ['cash', 'card', 'transfer', 'mobile_money'],
          default: 'cash'
        },
        receiptNumber: { type: String, required: true },
        date: { type: Date, default: Date.now }
      }
    ],
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)