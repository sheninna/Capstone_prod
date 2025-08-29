const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Create a notification
router.post('/', notificationController.createNotification);

// Get notifications for a user
router.get('/:userId', notificationController.getUserNotifications);

// Mark a notification as read
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
