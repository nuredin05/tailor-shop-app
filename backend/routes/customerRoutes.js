const express = require('express')
const router = express.Router()
const { getCustomers, getCustomerById, createCustomer } = require('../controllers/customerController')
const { protect, officer } = require('../middleware/authMiddleware')

router.route('/')
  .get(protect, getCustomers)
  .post(protect, officer, createCustomer)

router.route('/:id')
  .get(protect, getCustomerById)

module.exports = router
