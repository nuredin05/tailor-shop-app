const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-password')
      next()
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }
}

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' })
  }
}

const manager = (req, res, next) => {
  if (req.user && ['manager', 'admin', 'superadmin'].includes(req.user.role)) {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as a manager' })
  }
}

const officer = (req, res, next) => {
  if (req.user && ['officer', 'manager', 'admin', 'superadmin'].includes(req.user.role)) {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as an officer' })
  }
}

// Cutter: can only update cutting-stage orders
const cutter = (req, res, next) => {
  if (req.user && ['cutter', 'manager', 'admin', 'superadmin'].includes(req.user.role)) {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as a cutter' })
  }
}

// Tailor: can only update sewing-stage orders
const tailor = (req, res, next) => {
  if (req.user && ['tailor', 'cutter', 'manager', 'admin', 'superadmin'].includes(req.user.role)) {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as a tailor' })
  }
}

// shopStaff: any production role (cutter, tailor, officer, manager, admin)
const shopStaff = (req, res, next) => {
  if (req.user && ['cutter', 'tailor', 'officer', 'manager', 'admin', 'superadmin'].includes(req.user.role)) {
    next()
  } else {
    res.status(403).json({ message: 'Not authorized as shop staff' })
  }
}

module.exports = { protect, admin, manager, officer, cutter, tailor, shopStaff }

