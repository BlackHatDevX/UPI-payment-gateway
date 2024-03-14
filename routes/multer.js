const multer = require('multer');

const storage = multer.diskStorage({
  destination: './public/profileImages',
  filename: (req, file, cb) => {
    cb(null, req.body.setUsername+'.jpg');
  }
});

const upload = multer({ storage });

module.exports = upload