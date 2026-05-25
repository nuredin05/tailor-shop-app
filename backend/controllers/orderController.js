const Order = require('../models/Order')
const Customer = require('../models/Customer')
const User = require('../models/User')
const Expense = require('../models/Expense')

// @desc    Get all orders with optional filter and search
// @route   GET /api/orders
// @access  Protected
const getOrders = async (req, res) => {
  try {
    const { status, search } = req.query
    let query = {}

    if (status) {
      // Handle multiple statuses if separated by comma
      if (status.includes(',')) {
        query.status = { $in: status.split(',') }
      } else {
        query.status = status
      }
    }

    // Role-based restrictions
    if (req.user && req.user.role === 'customer') {
      // Find the Customer profile linked to this User's email
      const customerProfile = await Customer.findOne({ email: req.user.email })
      if (!customerProfile) {
        return res.json([]) // No profile = no orders
      }
      query.customer = customerProfile._id
    } else if (search) {
      // Find customers matching search term first
      const customers = await Customer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      })
      const customerIds = customers.map(c => c._id)

      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customer: { $in: customerIds } }
      ]
    }

    const orders = await Order.find(query)
      .populate('customer')
      .populate('assignedTo', 'name email role')
      .sort({ dueDate: 1, createdAt: -1 }) // Sort by deadline priority

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Protected
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer')
      .populate('assignedTo', 'name email role')
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a new order
// @route   POST /api/orders
// @access  Protected (Officer / Manager)
const createOrder = async (req, res) => {
  const { customerId, items, dueDate, notes, initialPaymentAmount, paymentMethod } = req.body

  try {
    if (!customerId || !items || items.length === 0 || !dueDate) {
      return res.status(400).json({ message: 'Please provide all required fields' })
    }

    const customer = await Customer.findById(customerId)
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    // Auto-generate order number
    let count = await Order.countDocuments()
    let orderNumber = `ORD-${1001 + count}`
    let exists = await Order.findOne({ orderNumber })
    while (exists) {
      count++
      orderNumber = `ORD-${1001 + count}`
      exists = await Order.findOne({ orderNumber })
    }

    // Calculate total amount
    const totalAmount = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0)

    // Handle initial payment
    const payments = []
    let amountPaid = 0
    let paymentStatus = 'unpaid'

    if (initialPaymentAmount && Number(initialPaymentAmount) > 0) {
      const amt = Number(initialPaymentAmount)
      amountPaid = amt
      
      const receiptNumber = `REC-${100000 + Math.floor(Math.random() * 900000)}`
      payments.push({
        amount: amt,
        method: paymentMethod || 'cash',
        receiptNumber,
        date: new Date()
      })

      if (amountPaid >= totalAmount) {
        paymentStatus = 'fully_paid'
      } else {
        paymentStatus = 'partially_paid'
      }
    }

    const order = await Order.create({
      orderNumber,
      customer: customerId,
      items,
      totalAmount,
      amountPaid,
      paymentStatus,
      dueDate,
      payments,
      notes,
      status: 'pending'
    })

    const populated = await Order.findById(order._id).populate('customer')
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Process order payment (Add payment and generate receipt)
// @route   POST /api/orders/:id/payments
// @access  Protected (Officer / Manager)
const processOrderPayment = async (req, res) => {
  const { amount, method } = req.body

  try {
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const newAmountPaid = order.amountPaid + Number(amount)
    if (newAmountPaid > order.totalAmount) {
      return res.status(400).json({ message: `Payment exceeds total order amount of ${order.totalAmount}` })
    }

    const receiptNumber = `REC-${100000 + Math.floor(Math.random() * 900000)}`
    
    order.payments.push({
      amount: Number(amount),
      method: method || 'cash',
      receiptNumber,
      date: new Date()
    })

    order.amountPaid = newAmountPaid
    if (order.amountPaid >= order.totalAmount) {
      order.paymentStatus = 'fully_paid'
    } else {
      order.paymentStatus = 'partially_paid'
    }

    await order.save()
    const populated = await Order.findById(order._id).populate('customer').populate('assignedTo', 'name email role')
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Protected
const updateOrderStatus = async (req, res) => {
  const { status } = req.body

  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.status = status || order.status
    await order.save()

    const populated = await Order.findById(order._id).populate('customer').populate('assignedTo', 'name email role')
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Reassign order/task to a tailor
// @route   PUT /api/orders/:id/assign
// @access  Protected (Manager only)
const reassignOrder = async (req, res) => {
  const { employeeId } = req.body

  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (employeeId) {
      const employee = await User.findById(employeeId)
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' })
      }
      order.assignedTo = employeeId
    } else {
      order.assignedTo = undefined
    }

    await order.save()
    const populated = await Order.findById(order._id).populate('customer').populate('assignedTo', 'name email role')
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get total shop performance metrics, bottlenecks, employee rates, financial summaries
// @route   GET /api/orders/metrics
// @access  Protected (Manager only)
const getShopMetrics = async (req, res) => {
  try {
    // 1. Performance Metrics
    const totalOrders = await Order.countDocuments()
    const completedOrders = await Order.countDocuments({ status: { $in: ['completed', 'delivered'] } })
    const activeOrders = await Order.countDocuments({ status: { $nin: ['completed', 'delivered'] } })
    
    // Revenue calculations (all payments received)
    const ordersWithPayments = await Order.find({})
    let totalRevenue = 0
    ordersWithPayments.forEach(order => {
      order.payments.forEach(p => {
        totalRevenue += p.amount
      })
    })

    // Expenses calculations
    const expenses = await Expense.find({})
    let totalExpenses = 0
    expenses.forEach(e => {
      totalExpenses += e.amount
    })

    const profit = totalRevenue - totalExpenses

    // 2. Active Bottlenecks: Orders not completed/delivered whose due dates are overdue or due today
    const today = new Date()
    const bottleneckOrders = await Order.find({
      status: { $nin: ['completed', 'delivered'] },
      dueDate: { $lt: today }
    }).populate('customer').populate('assignedTo', 'name')

    // 3. Employee production rates
    // Get all cutter employees
    const tailors = await User.find({ role: 'cutter' })
    const employeeRates = []

    for (const tailor of tailors) {
      const totalAssigned = await Order.countDocuments({ assignedTo: tailor._id })
      const completedCount = await Order.countDocuments({ 
        assignedTo: tailor._id, 
        status: { $in: ['completed', 'delivered'] } 
      })
      const activeCount = totalAssigned - completedCount
      
      employeeRates.push({
        _id: tailor._id,
        name: tailor.name,
        email: tailor.email,
        totalAssigned,
        completed: completedCount,
        active: activeCount,
        completionRate: totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0
      })
    }

    // 4. Financial profit summary breakdown (Revenue vs Expenses by Category)
    const expenseBreakdown = {
      payroll: 0,
      rent: 0,
      materials: 0,
      utilities: 0,
      marketing: 0,
      other: 0
    }
    expenses.forEach(e => {
      if (expenseBreakdown[e.category] !== undefined) {
        expenseBreakdown[e.category] += e.amount
      } else {
        expenseBreakdown.other += e.amount
      }
    })

    res.json({
      performance: {
        totalOrders,
        completedOrders,
        activeOrders,
        totalRevenue,
        totalExpenses,
        profit
      },
      bottlenecks: bottleneckOrders.map(b => ({
        _id: b._id,
        orderNumber: b.orderNumber,
        customerName: b.customer?.name || 'Unknown',
        status: b.status,
        dueDate: b.dueDate,
        assignedTo: b.assignedTo?.name || 'Unassigned',
        daysOverdue: Math.ceil((today - new Date(b.dueDate)) / (1000 * 60 * 60 * 24))
      })),
      employeeRates,
      financials: {
        totalRevenue,
        totalExpenses,
        profit,
        expenseBreakdown
      }
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Protected (Manager)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    await order.deleteOne()
    res.json({ message: 'Order removed successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  processOrderPayment,
  updateOrderStatus,
  reassignOrder,
  getShopMetrics,
  deleteOrder
}
