const Notification = require('../models/Notification')

// @desc    Get user notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Mark notification as read
const markRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
    if (!notification) return res.status(404).json({ message: 'Notification not found' })

    notification.is_read = true
    await notification.save()
    res.json(notification)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getNotifications, markRead }
