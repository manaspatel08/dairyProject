// import multer from 'multer';
// import path from 'path';

// const storage = multer.diskStorage({
//   destination: './uploads/',
//   filename: function(req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// export default upload; 

// export const setBaseUrl = (req, res, next) => {
//     const host = process.env.HOST || req.hostname;
//     const port = process.env.PORT;
    
//     req.baseUrlFull = `${req.protocol}://${host}:${port}`;
//     next();
// };


import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "dairyProject/products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

export default upload;
