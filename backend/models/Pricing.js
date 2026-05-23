const mongoose = require('mongoose')

const ALL_MEASUREMENTS = ['chest', 'waist', 'hips', 'shoulder', 'sleeves', 'inseam', 'neck', 'length']

const pricingSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      required: [true, 'Garment or item type is required'],
      unique: true,
      trim: true
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    estimatedDays: {
      type: Number,
      default: 3,
      min: [1, 'Must take at least 1 day']
    },
    requiredMeasurements: {
      type: [String],
      enum: ALL_MEASUREMENTS,
      default: ALL_MEASUREMENTS
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Pricing', pricingSchema)
