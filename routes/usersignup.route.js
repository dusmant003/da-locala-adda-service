const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");

// User Signup Route
router.post('/usersignup', async (req, res) => {
    try {
        const { fullname, emailaddress, password, confirmPassword } = req.body;

        // Validation
        if (!fullname || !emailaddress || !password || !confirmPassword) {
            return res.status(400).json({ message: "Please provide all fields", success: false });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match", success: false });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Insert user
        const result = await db.executeQuery(
            "INSERT INTO app_users (fullname, emailaddress, password) VALUES (?, ?, ?)",
            [fullname, emailaddress, hashedPassword] 
        );

        if (result && result.affectedRows > 0) {
            return res.status(200).json({
                message: "User added successfully",
                success: true,
                userId: result.insertId
            });
        } else {
            return res.status(500).json({ message: "Failed to add user", success: false });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
});

module.exports = router;
