const express = require('express');
const router = express.Router();
const db = require('../config/db');

// admin  route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "please provide email and pasdword" });
        }
        const exestingUser = await db.executeQuery("SELECT * FROM admins WHERE EMAIL = ? AND PASSWORD = ?",
            [email, password]);
            
        if (exestingUser.length > 0) {
            return res.status(200).json({ message: 'login successfully', success: true, user: exestingUser[0] });
        } else {
            return res.status(500).json({ message: "invaild credentials", success: false })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });

    }
})

module.exports = router;