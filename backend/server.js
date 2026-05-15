const express = require('express')
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const chatRoutes = require('./routes/chatRoutes')

connectDB()

const app = express()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/chat', chatRoutes)

// Health check
app.get('/', (req, res) => res.json({ message: 'API is running...' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
