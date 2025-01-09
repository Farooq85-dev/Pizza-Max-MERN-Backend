// Libraries Imports
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the uploads folder exists
const uploadDir = path.join("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueFileId = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${file.fieldname}-${uniqueFileId}-${file.originalname}`;
    req.uploadedFiles = req.uploadedFiles || [];
    req.uploadedFiles.push(path.join("uploads", filename));
    cb(null, filename);
  },
});

const Multer = multer({ storage: storage });

export default Multer;
