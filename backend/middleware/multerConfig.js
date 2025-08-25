const multer = require('multer');
const path = require('path');

// Set up multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the correct path for the upload folder
    const uploadPath = path.join(__dirname, '../uploads');  // Goes one level up to the root
    cb(null, uploadPath);  // Ensure multer stores files in the uploads folder
  },
  filename: (req, file, cb) => {
    // Save file with a unique name (timestamp + original file extension)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
