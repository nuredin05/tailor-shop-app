const Customer = require('../models/Customer')
const { notifyManagers } = require('../utils/notifyManagers')

// @desc    Get all customers with search filtering
// @route   GET /api/customers
// @access  Protected (Officer / Manager)
const getCustomers = async (req, res) => {
  try {
    const { search } = req.query
    let query = {}

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }
    }

    const customers = await Customer.find(query).sort({ name: 1 })
    res.json(customers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single customer details
// @route   GET /api/customers/:id
// @access  Protected
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }
    res.json(customer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Protected (Officer / Manager)
const createCustomer = async (req, res) => {
  const { name, email, phone, address, measurements } = req.body

  try {
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone number are required' })
    }

    // Check if phone or email exists
    const customerExists = await Customer.findOne({ phone })
    if (customerExists) {
      return res.status(400).json({ message: 'A customer with this phone number already exists' })
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address,
      measurements: measurements || {}
    })

    // Notify all managers/admins of the new customer
    await notifyManagers(
      '👤 New Customer Registered',
      `${name} has been added as a new customer. Phone: ${phone}${email ? ', Email: ' + email : ''}`
    )

    res.status(201).json(customer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Protected (Manager)
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    await customer.deleteOne()
    res.json({ message: 'Customer removed successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  deleteCustomer
}
