const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require('jsonwebtoken')

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

// user login router
router.post('/userlogin', async (req, res) => {
  try {
    const { emailaddress, password } = req.body;
    // validation
    if (!emailaddress || !password) {
      return res.status(400).json({ message: "Please provide email and password", success: false });

    }
    // check user
    const user = await db.executeQuery("SELECT * FROM app_users WHERE emailaddress =?", [emailaddress]);
    if (user && user.length > 0) {
      // check password
      const isPawwordMatch = await bcrypt.compare(password, user[0].password);

      if (isPawwordMatch) {
        // generate JWT token
        const token = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({ message: "login successfully", success: true, token, user: user[0] });

      } else {
        return res.status(401).json({ message: "invaild credentials", success: false })
      }

    } else {
      return res.status(404).json({ message: "user not found", success: false })
    }


  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
});

module.exports = router;
