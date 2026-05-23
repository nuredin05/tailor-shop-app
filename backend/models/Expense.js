const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['payroll', 'rent', 'materials', 'utilities', 'marketing', 'other']
    },
    date: {
      type: Date,
      default: Date.now
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Expense', expenseSchema)
