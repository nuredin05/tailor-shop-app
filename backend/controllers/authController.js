const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const sendEmail = require('../utils/sendEmail')

// @desc    Register a new user
const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' })
    }
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }
    const user = await User.create({ name, email, password, phone })
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status,
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status,
      profileImage: user.profileImage,
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Forgot Password - Send Code
const forgotPassword = async (req, res) => {
  const { identifier } = req.body // Can be email or phone
  try {
    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }]
    })

    if (!user) {
      return res.status(404).json({ error: 'No user found with that identifier' })
    }

    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    // Send via Email
    const message = `Your password reset code is: ${resetToken}. It will expire in 10 minutes.`
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #075985; border-radius: 10px; max-width: 500px;">
        <h2 style="color: #075985;">Password Reset Request</h2>
        <p>You requested a password reset. Please use the following code to reset your access:</p>
        <div style="font-size: 24px; font-weight: bold; color: #075985; padding: 15px; background: #F1EEFF; border-radius: 8px; text-align: center; letter-spacing: 5px;">
          ${resetToken}
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      </div>
    `

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Code',
        message,
        html
      })
      res.status(200).json({ message: 'Reset code sent to your email' })
    } catch (err) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save({ validateBeforeSave: false })
      return res.status(500).json({ error: 'Email could not be sent' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// @desc    Reset Password
const resetPassword = async (req, res) => {
  const { code, password } = req.body
  const resetPasswordToken = crypto.createHash('sha256').update(code).digest('hex')
  try {
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } })
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' })
    }
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()
    res.status(200).json({ message: 'Password reset successful' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get logged-in user profile
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password')
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
}

// @desc    Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.name = req.body.name || user.name
    user.phone = req.body.phone || user.phone
    user.address = req.body.address || user.address
    if (req.body.password) {
      user.password = req.body.password
    }

    if (req.body.removeImage === 'true') {
      if (user.profileImage) {
        const filePath = path.join(__dirname, '..', user.profileImage)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        user.profileImage = ''
      }
    }

    if (req.file) {
      if (user.profileImage) {
        const oldPath = path.join(__dirname, '..', user.profileImage)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }
      user.profileImage = `/uploads/${req.file.filename}`
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
      status: updatedUser.status,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' })
    }

    // Don't allow deleting other superadmins if you are just an admin
    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmins can delete other superadmins' })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Don't allow changing role of superadmins if you are just an admin
    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmins can change roles of other superadmins' })
    }

    user.role = req.body.role || user.role
    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a user (Admin only)
const createUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' })
    }
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Only superadmins can create other superadmins
    if (role === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmins can create other superadmins' })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      phone
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user status (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Don't allow deactivating superadmins
    if (user.role === 'superadmin' && req.body.status === 'deactivated') {
      return res.status(403).json({ message: 'Super admins cannot be deactivated' })
    }

    user.status = req.body.status || user.status
    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      status: updatedUser.status
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword, 
  getUserProfile, 
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
  createUser,
  updateUserStatus
}
