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
  check("credential").exists({ checkFalsy: true }).notEmpty().withMessage("Please provide a valid email or username."),
  check("password").exists({ checkFalsy: true }).withMessage("Please provide a password."),
  handleValidationErrors,
];

// Restore session user
router.get("/", restoreUser, (req, res) => {
  const User = req.user.dataValues;
  
  if (User) {
    const safeUser = {
      id: User.id,
      email: User.email,
      username: User.username,
    };
    return res.json({
      user: safeUser,
    });
  } else return res.json({ user: null });
});

// Log in
router.post("/", validateLogin, async (req, res, next) => {
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
    // err.title = "Login failed";
    // err.errors = { credential: "The provided credentials were invalid." };
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
});

// Log out
router.delete("/", (_req, res) => {
  res.clearCookie("token");
  return res.json({ message: "success" });
});

module.exports = router;
