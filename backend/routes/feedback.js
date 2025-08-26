const express = require('express');
const { submitFeedback } = require('../controllers/feedbackController'); 
const protect = require('../middleware/auth');  
const router = express.Router();

router.post('/submit-feedback', protect, submitFeedback);

module.exports = router;