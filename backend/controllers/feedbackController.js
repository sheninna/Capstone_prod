const Feedback = require('../models/feedback');  // Feedback model

// Controller to handle the feedback submission
const submitFeedback = async (req, res) => {
  const { feedback, rating } = req.body;

  if (!feedback || !rating) {
    return res.status(400).json({ message: 'Feedback and rating are required' });
  }

  try {
    // Create new feedback entry
    const newFeedback = new Feedback({
      feedback,
      rating,
      userId: req.user.id,  // User ID from JWT payload (stored in req.user by the middleware)
    });

    // Save feedback to the database
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitFeedback };
