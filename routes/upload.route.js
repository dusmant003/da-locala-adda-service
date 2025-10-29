const express = require('express');
const router = express.Router();
const upload = require('../middleWares/upload');


// upload route
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('no file uploaded');
    } else {
        res.status(200).json({ message: 'file uploaded successfully', success: true, file: req.file });
    }
})

module.exports = router;