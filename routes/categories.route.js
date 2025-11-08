const express = require('express');
const router = express.Router();
const db = require('../config/db');
const upload = require('../middleWares/upload');

// add categories route
router.post('/addcategories', upload.single('file'), async (req, res) => {
    try {
        const { name, is_active } = req.body;
        const file = req.file;

        // validation
        if (!name || !is_active || !file) {
            return res.status(400).json({
                message: "please provide all fields",
                success: false
            });
        }
        // insert into database
        const result = await db.executeQuery('INSERT INTO food_categories (name, is_active, image) VALUES(?,?,?)'
            , [name, is_active, file.filename]);
        // check insertion
        if (result && result.affectedRows > 0) {
            return res.status(200).json({
                message: "category added successfully",
                success: true, category: result
            });
        } else {
            return res.status(500).json({
                message: "failed to add category",
                success: false
            });

        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error", success: false });
    }
})

// export
module.exports = router;