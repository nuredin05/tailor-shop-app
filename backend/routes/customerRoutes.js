const express = require('express')
const router = express.Router()
const { getCustomers, getCustomerById, createCustomer, deleteCustomer } = require('../controllers/customerController')
const { protect, officer, manager } = require('../middleware/authMiddleware')

router.route('/')
  .get(protect, getCustomers)
  .post(protect, officer, createCustomer)

router.route('/:id')
  .get(protect, getCustomerById)
  .delete(protect, manager, deleteCustomer)

module.exports = router
