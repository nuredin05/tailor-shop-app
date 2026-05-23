const Pricing = require('../models/Pricing')

// @desc    Get all pricing structures
// @route   GET /api/pricing
// @access  Protected
const getPricing = async (req, res) => {
  try {
    const pricings = await Pricing.find({}).sort({ itemType: 1 })
    res.json(pricings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create or update pricing structure
// @route   POST /api/pricing
// @access  Protected (Manager only)
const upsertPricing = async (req, res) => {
  const { itemType, basePrice, estimatedDays } = req.body

  try {
    if (!itemType || basePrice === undefined) {
      return res.status(400).json({ message: 'Item type and base price are required' })
    }

    let pricing = await Pricing.findOne({ itemType })

    if (pricing) {
      pricing.basePrice = basePrice
      if (estimatedDays !== undefined) pricing.estimatedDays = estimatedDays
      await pricing.save()
      res.json(pricing)
    } else {
      pricing = await Pricing.create({
        itemType,
        basePrice,
        estimatedDays: estimatedDays || 3
      })
      res.status(201).json(pricing)
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update a pricing structure by ID
// @route   PUT /api/pricing/:id
// @access  Protected (Manager only)
const updatePricing = async (req, res) => {
  const { basePrice, estimatedDays } = req.body

  try {
    const pricing = await Pricing.findById(req.params.id)
    if (!pricing) {
      return res.status(404).json({ message: 'Pricing structure not found' })
    }

    if (basePrice !== undefined) pricing.basePrice = basePrice
    if (estimatedDays !== undefined) pricing.estimatedDays = estimatedDays

    await pricing.save()
    res.json(pricing)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getPricing,
  upsertPricing,
  updatePricing
}
