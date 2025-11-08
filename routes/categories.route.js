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
});

// get categories router
router.get('/getcategories', async (req, res) => {
    try {
        const result = await db.executeQuery("SELECT * FROM food_categories");
        if (result && result.length > 0) {
            return res.status(200).json({ message: "categories fetched successfully", success: true, categories: result });
        } else {
            return res.status(500).json({ message: "failed to fetch categories", success: false });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error", success: false });
    }
});

// update categories router
router.put('/updatecategory/:id', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, is_active } = req.body;
        const file = req.file;
        // check id
        if (!id) {
            return res.status(400).json({ message: "please provide category id", success: false });
        }

        if (file) {
            await db.executeQuery(`UPDATE food_categories SET name = ?, is_active = ?, image = ? WHERE id = ?`,
                [name, is_active, file.filename, id]
            );
        } else {
            await db.executeQuery(`UPDATE food_categories SET name = ?, is_active = ? WHERE id = ?`,
                [name, is_active, id]
            );
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error", success: false });
    }
});

// deletecategories router
router.delete('/deletecategory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "please provide category id", success: false });
        }
        // delete from database
        const result = await db.executeQuery("DELETE FROM food_categories WHERE id = ?", [id]);
        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "category deleted successfully", success: true })
        } else {
            return res.status(500).json({ message: "failed to delete category", success: false })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error", success: false });
    }
})


// export
module.exports = router;