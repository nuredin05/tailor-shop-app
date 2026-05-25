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
      // General
      chest: { type: Number, default: 0 },
      waist: { type: Number, default: 0 },
      hips: { type: Number, default: 0 },
      shoulder: { type: Number, default: 0 },
      sleeves: { type: Number, default: 0 },
      inseam: { type: Number, default: 0 },
      neck: { type: Number, default: 0 },
      length: { type: Number, default: 0 },
      
      // Shirt Specific
      fullLengthBack: { type: Number, default: 0 },
      fullLengthFront: { type: Number, default: 0 },
      acrossChest: { type: Number, default: 0 },
      acrossShoulder: { type: Number, default: 0 },
      shoulderLength: { type: Number, default: 0 },
      centerLength: { type: Number, default: 0 },
      shoulderSlope: { type: Number, default: 0 },
      acrossBack: { type: Number, default: 0 },
      backNeck: { type: Number, default: 0 },

      // Trouser Specific
      pantLength: { type: Number, default: 0 },
      crotchDepth: { type: Number, default: 0 },
      hipDepth: { type: Number, default: 0 },
      waistArcFront: { type: Number, default: 0 },
      waistArcBack: { type: Number, default: 0 },
      hipArcFront: { type: Number, default: 0 },
      hipArcBack: { type: Number, default: 0 },

      // Coat & Sleeve Specific
      bicep: { type: Number, default: 0 },
      capHeight: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Customer', customerSchema)