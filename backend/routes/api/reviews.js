const express = require('express');
const router = express.Router();
const Review = require('../../db/models/Spot');

const { requireAuth } =  require('../../utils/auth');

module.exports = router;