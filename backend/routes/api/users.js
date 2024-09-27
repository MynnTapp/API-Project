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
  check("username").exists({ checkFalsy: true }).isLength({ min: 4 }).withMessage("Please provide a username with at least 4 characters."),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  // check("password").exists({ checkFalsy: true }).isLength({ min: 6 }).withMessage("Password must be 6 characters or more."),
  check("firstName").exists({ checkFalsy: true }).withMessage("First Name is required."),
  check("lastName").exists({ checkFalsy: true }).withMessage("Last Name is required."),
  handleValidationErrors,
];

// Sign up
// router.post("/", validateSignup, async (req, res) => {
//   const { email, password, username, firstName, lastName } = req.body;
//   const hashedPassword = bcrypt.hashSync(password);
//   const user = await User.create({ email, firstName, lastName, username, hashedPassword });

//   const safeUser = {
//     id: user.id,
//     firstName: user.firstName,
//     lastName: user.lastName,
//     email: user.email,
//     username: user.username,
//   };

//   await setTokenCookie(res, safeUser);

//   return res.status(201).json({
//     user: safeUser,
//   });
// });

// router.get("/current", requireAuth, async (req, res) => {
//   const { user } = req;
//   if (!user) {
//     return res.status(200).json({ user: null });
//   }
//   return res.status(200).json({
//     user: {
//       id: user.id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       username: user.username,
//     },
//   });
// });

router.post("/", validateSignup, async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  const hashedPassword = bcrypt.hashSync(password);
  try {
    const user = await User.create({ email, firstName, lastName, username, hashedPassword });
    if (!user) {
      return res.status(400).json({ message: "Failed to create user" });
    }
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };
    await setTokenCookie(res, safeUser);
    return res.status(200).json({
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
