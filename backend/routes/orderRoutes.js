const express = require('express')
const router = express.Router()
const {
  getOrders,
  getOrderById,
  createOrder,
  processOrderPayment,
  updateOrderStatus,
  reassignOrder,
  getShopMetrics,
  deleteOrder
} = require('../controllers/orderController')
const { protect, manager, officer, shopStaff } = require('../middleware/authMiddleware')

router.route('/')
  .get(protect, getOrders)
  .post(protect, officer, createOrder)

router.route('/metrics')
  .get(protect, manager, getShopMetrics)

router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, manager, deleteOrder)

router.route('/:id/status')
  .put(protect, shopStaff, updateOrderStatus)

router.route('/:id/assign')
  .put(protect, manager, reassignOrder)

router.route('/:id/payments')
  .post(protect, officer, processOrderPayment)

module.exports = router
