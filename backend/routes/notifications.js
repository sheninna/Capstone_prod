const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead
} = require('../controllers/notificationController');

// Create a notification
router.post('/', createNotification);

// Get notifications for a user
router.get('/:userId', getUserNotifications);

// Mark a notification as read
router.patch('/:id/read', markAsRead);

module.exports = router;
