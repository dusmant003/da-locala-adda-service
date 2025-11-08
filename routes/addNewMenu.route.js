const express = require("express")
const router = express.Router();
const upload = require('../middleWares/upload');
const db = require('../config/db');

// addnewmenu route

router.post('/addnewmenu', upload.single('file'), async (req, res) => {
    try {
        const { name, description, price, category, is_available } = req.body;
        const file = req.file;

        // validation
        if (!name || !description || !price || !category || !is_available || !file) {
            return res.status(400).json({ message: "please provide all fields", success: false });
        }

        // insert into database
        const result = await db.executeQuery("INSERT INTO menus (name, description, price, category, is_available, image_url) VALUES(?, ?, ?, ?, ?, ?)",
            [name, description, price, category, is_available, file.filename]
        );
        // check insertion
        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "menu added successfully", success: true, menu: result });
        } else {
            return res.status(500).json({ message: " failed to add menu ", success: false });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal server error', success: false });
    }
})

// getmenu router

router.get('/getmenu', async (req, res) => {
    try {
        const result = await db.executeQuery("SELECT * FROM menus");
        if (result && result.length > 0) {
            return res.status(200).json({ message: "menus fetched successfully", success: true, menus: result });
        } else {
            return res.status(500).json({ message: "failed to fetch menus", success: false });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error", success: false });
    }
})

// updateemnu router
router.put('/updatemenu/:id', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, is_available } = req.body;
        const file = req.file;

        if (!id) {
            return res.status.apply(400).json({ message: "please provide menu id", success: false });
        };

        if (file) {
            await db.executeQuery(`UPDATE menus SET name = ?, description = ?, price = ? , category = ?, image_url = ?, is_available =? WHERE id = ?`,
                [name, description, price, category, file.filename, is_available, id]
            );
        } else {
            await db.executeQuery(`UPDATE menus SET name = ?, description = ?, price = ? , category = ?, is_available =? WHERE id = ?`,
                [name, description, price, category, is_available, id]
            );
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error", success: false });
    }
})

// deletemenu
router.delete('/deletemenu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "please provide menu id", success: false });
        }
        // delete from database
        const result = await db.executeQuery("DELETE FROM menus WHERE id = ?", [id]);
        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "menu deleted successfully", success: true })
        } else {
            return res.status(500).json({ message: "failed to delete menu", success: false })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "internal server error", success: false })
    }
})

// export
module.exports = router;