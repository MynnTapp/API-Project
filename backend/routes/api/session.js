// backend/routes/api/session.js
const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { setTokenCookie, restoreUser } = require("../../utils/auth");
const { User } = require("../../db/models");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const router = express.Router();

// Middleware
const validateLogin = [
  check("credential").exists({ checkFalsy: true }).withMessage("Email or username is required"),
  check("password").exists({ checkFalsy: true }).withMessage("Password is required"),
  handleValidationErrors,
];

// Restore session user
// router.get("/", restoreUser, (req, res) => {
//   const User = req.user.dataValues;

//   if (User) {
//     const safeUser = {
//       id: User.id,
//       firstName: User.firstName,
//       lastName: User.lastName,
//       email: User.email,
//       username: User.username,
//     };
//     return res.status.json({
//       user: safeUser,
//     });
//   } else return res.status(200).json({ user: null });
// });

router.get("/", restoreUser, (req, res) => {
  if (!req.user) {
    return res.status(200).json({ user: null });
  }
  const User = req.user.dataValues;
  const safeUser = {
    id: User.id,
    firstName: User.firstName,
    lastName: User.lastName,
    email: User.email,
    username: User.username,
  };
  return res.status(200).json({
    user: safeUser,
  });
});

// Log in
// Log in
router.post("/", validateLogin, async (req, res, next) => {
  try {
    const { credential, password } = req.body;

    const user = await User.unscoped().findOne({
      where: {
        [Op.or]: {
          username: credential,
          email: credential,
        },
      },
    });

    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
      const err = new Error("Invalid credentials");
      err.status = 401;
      err.title = "Login failed";
      err.errors = { credential: "Invalid credentials" };
      return next(err);
    }

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      message: "Error logging in",
      error: error.message, // Return the error message
    });
  }
});
// Log out
router.delete("/", (_req, res) => {
  res.clearCookie("token");
  return res.json({ message: "success" });
});

module.exports = router;
