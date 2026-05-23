const Expense = require('../models/Expense')
const User = require('../models/User')

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Protected (Manager / Admin)
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({})
      .populate('employee', 'name email role')
      .sort({ date: -1 })
    res.json(expenses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a new expense or payroll entry
// @route   POST /api/expenses
// @access  Protected (Manager / Admin)
const createExpense = async (req, res) => {
  const { description, amount, category, date, employeeId } = req.body

  try {
    if (!description || !amount || !category) {
      return res.status(400).json({ message: 'Description, amount and category are required' })
    }

    const expenseData = {
      description,
      amount,
      category,
      date: date || Date.now()
    }

    if (category === 'payroll' && employeeId) {
      const employee = await User.findById(employeeId)
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' })
      }
      expenseData.employee = employeeId
    }

    const expense = await Expense.create(expenseData)
    const populated = await Expense.findById(expense._id).populate('employee', 'name email role')

    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getExpenses,
  createExpense
}
