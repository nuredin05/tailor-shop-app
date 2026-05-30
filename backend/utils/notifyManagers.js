const User = require('../models/User')
const Notification = require('../models/Notification')

/**
 * Create a notification for all managers and admins.
 * @param {string} title  - Short notification title
 * @param {string} message - Notification body
 */
const notifyManagers = async (title, message) => {
  try {
    const managers = await User.find({
      role: { $in: ['manager', 'admin', 'superadmin'] }
    }).select('_id')

    if (!managers.length) return

    const docs = managers.map(m => ({
      user: m._id,
      title,
      message,
      is_read: false
    }))

    await Notification.insertMany(docs)
  } catch (err) {
    // Non-critical — don't crash the main request
    console.error('[notifyManagers] Failed to create notifications:', err.message)
  }
}

module.exports = { notifyManagers }
