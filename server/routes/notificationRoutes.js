const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead
} = require('../controllers/notificationController');

router.get('/me', verifyToken, getMyNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.patch('/read-all', verifyToken, markAllNotificationsRead);
router.patch('/:id/read', verifyToken, markNotificationRead);

module.exports = router;
