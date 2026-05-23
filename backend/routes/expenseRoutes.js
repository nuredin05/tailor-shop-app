const express = require('express')
const router = express.Router()
const { getExpenses, createExpense } = require('../controllers/expenseController')
const { protect, manager } = require('../middleware/authMiddleware')

router.route('/')
  .get(protect, manager, getExpenses)
  .post(protect, manager, createExpense)

module.exports = router
