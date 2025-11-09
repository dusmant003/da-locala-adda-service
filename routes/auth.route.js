const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../middleWares/mailer");
const db = require("../config/db"); 
require('dotenv').config();

const OTP_EXPIRY_MIN = 5; // OTP valid for 5 min

// --- Send OTP ---
router.post("/send-otp", async (req, res) => {
    try {
        const { emailaddress } = req.body;
        if (!emailaddress)
            return res.status(400).json({ message: "Please provide email", success: false });

        const users = await db.executeQuery(
            "SELECT * FROM app_users WHERE emailaddress = ?",
            [emailaddress]
        );
        if (!users || users.length === 0)
            return res.status(404).json({ message: "User not found", success: false });

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const salt = await bcrypt.genSalt(10);
        const otpHash = await bcrypt.hash(otp, salt);
        const expiry = new Date(Date.now() + OTP_EXPIRY_MIN * 60000); // 5 min

        await db.executeQuery(
            "UPDATE app_users SET otp = ?, otp_expiry = ? WHERE emailaddress = ?",
            [otpHash, expiry, emailaddress]
        );

        const emailResult = await sendEmail({
            to: emailaddress,
            subject: "Your OTP for login",
            text: `Your OTP is: ${otp}. It is valid for ${OTP_EXPIRY_MIN} minutes.`,
        });

        if (!emailResult)
            return res.status(500).json({ message: "Failed to send OTP", success: false });

        res.json({ message: "OTP sent successfully", success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", success: false });
    }
});

// --- Verify OTP ---
router.post("/verify-otp", async (req, res) => {
    try {
        const { emailaddress, otp } = req.body;
        if (!emailaddress || !otp)
            return res.status(400).json({ message: "Please provide email and OTP", success: false });

        const users = await db.executeQuery(
            "SELECT * FROM app_users WHERE emailaddress = ?",
            [emailaddress]
        );
        if (!users || users.length === 0)
            return res.status(404).json({ message: "User not found", success: false });

        const user = users[0];

        if (!user.otp_expiry || new Date(user.otp_expiry) < new Date())
            return res.status(400).json({ message: "OTP expired", success: false });

        const isMatch = await bcrypt.compare(otp, user.otp);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid OTP", success: false });

        if (!user.id)
            return res.status(500).json({ message: "User ID missing", success: false });

        const token = jwt.sign({ id: user.id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" });

        await db.executeQuery(
            "UPDATE app_users SET otp = NULL, otp_expiry = NULL WHERE emailaddress = ?",
            [emailaddress]
        );

        res.json({ message: "OTP verified successfully", success: true, token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", success: false });
    }
});

module.exports = router;
