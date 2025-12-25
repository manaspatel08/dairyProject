import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

export default upload; 

export const setBaseUrl = (req, res, next) => {
    const host = process.env.HOST || req.hostname;
    const port = process.env.PORT;
    
    req.baseUrlFull = `${req.protocol}://${host}:${port}`;
    next();
};
