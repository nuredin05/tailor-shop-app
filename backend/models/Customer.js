const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    measurements: {
      chest: { type: Number, default: 0 },
      waist: { type: Number, default: 0 },
      hips: { type: Number, default: 0 },
      shoulder: { type: Number, default: 0 },
      sleeves: { type: Number, default: 0 },
      inseam: { type: Number, default: 0 },
      neck: { type: Number, default: 0 },
      length: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Customer', customerSchema)