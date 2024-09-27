// backend/routes/api/index.js
const router = require("express").Router();
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const { restoreUser } = require("../../utils/auth.js");
const spots = require("./spots.js");
const spotImages = require("./spot-images.js");
const review = require("./reviews.js");
const reviewImages = require("./review-images.js");
const booking = require("./bookings.js");
// Connect restoreUser middleware to the API router
// If current user session is valid, set req.user to the user in the database
// If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use("/session", sessionRouter);

router.use("/users", usersRouter);

router.use("/spots", spots);

router.use("/spot-images", spotImages);

router.use("/reviews", review);

router.use("/review-images", reviewImages);

router.use("/bookings", booking);

// router.post("/test", (req, res) => {
//   res.json({ requestBody: req.body });
//});

module.exports = router;
