import fs from "fs";

const FilesCleanup = (req, res, next) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
};

export default FilesCleanup;
