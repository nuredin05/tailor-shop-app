const express = require('express')
const router = express.Router()
const { getPricing, upsertPricing, updatePricing } = require('../controllers/pricingController')
const { protect, manager } = require('../middleware/authMiddleware')

router.route('/')
  .get(protect, getPricing)
  .post(protect, manager, upsertPricing)

router.route('/:id')
  .put(protect, manager, updatePricing)

module.exports = router
