// backend/routes/api/users.js
const express = require("express");
const bcrypt = require("bcryptjs");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const router = express.Router();

// Middleware
const validateSignup = [
  check("email").exists({ checkFalsy: true }).isEmail().withMessage("Please provide a valid email."),
  check("username").exists({ checkFalsy: true }).isLength({ min: 4 }).withMessage("Username is required"),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  // check("password").exists({ checkFalsy: true }).isLength({ min: 6 }).withMessage("Password must be 6 characters or more."),
  check("firstName").exists({ checkFalsy: true }).withMessage("First Name is required."),
  check("lastName").exists({ checkFalsy: true }).withMessage("Last Name is required."),
  handleValidationErrors,
];

router.post("/", validateSignup, async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  const hashedPassword = bcrypt.hashSync(password);
  try {
    const user = await User.create({ email, firstName, lastName, username, hashedPassword });
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };
    await setTokenCookie(res, safeUser);
    return res.status(201).json({
      user: safeUser,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      const errors = {};
      error.errors.forEach((err) => {
        if (err.path === "email") {
          errors.email = "User with that email already exists";
        } else if (err.path === "username") {
          errors.username = "User with that username already exists";
        }
      });
      return res.status(500).json({
        message: "User already exists",
        errors,
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
