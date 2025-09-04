const express = require('express');
const router = express.Router();
const { sendSignupOtp, verifySignupOtp } = require('../controllers/otpController');

router.post('/send-signup', sendSignupOtp);
router.post('/verify-signup', verifySignupOtp);

module.exports = router;