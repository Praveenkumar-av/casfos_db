// middleware/pdfUpload.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`); // Changed "pdf" to "file" to be more generic
  },
});

const fileFilter = (req, file, cb) => {
  // Define allowed MIME types for PDFs and images
  const allowedTypes = [
    "application/pdf", // PDF files
    "image/jpeg",      // JPEG images (.jpg, .jpeg)
    "image/png",       // PNG images (.png)
    "image/jpg",       // JPG images (sometimes used)
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only PDF, JPEG, and PNG files are allowed!"), false); // Reject the file
  }
};

const pdfUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = pdfUpload;