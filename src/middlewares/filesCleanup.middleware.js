import fs from "fs";

const FilesCleanup = (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode !== 200 && req.uploadedFiles) {
      req.uploadedFiles.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });
  next();
};

export default FilesCleanup;
