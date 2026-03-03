import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./public/temp");
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    // Randomized filename avoids collisions and unsafe original names.
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Restrict uploads to images only.
  if (!file.mimetype?.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
