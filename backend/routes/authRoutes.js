const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  forgotPassword, 
  resetPassword, 
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUserRole,
  createUser,
  updateUserStatus 
} = require('../controllers/authController')
const { protect, admin, manager } = require('../middleware/authMiddleware')

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
  }
})

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed.'), false)
  }
}

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter
})

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, upload.single('profileImage'), updateUserProfile)

// Admin/Manager Routes
router.get('/users', protect, manager, getAllUsers)
router.post('/users', protect, admin, createUser)
router.delete('/users/:id', protect, admin, deleteUser)
router.put('/users/:id/role', protect, admin, updateUserRole)
router.put('/users/:id/status', protect, admin, updateUserStatus)

module.exports = router
