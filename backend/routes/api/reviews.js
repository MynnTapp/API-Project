const express = require("express");
const router = express.Router();
const { Review, User, Spot, ReviewImage, SpotImage } = require("../../db/models");

const { requireAuth } = require("../../utils/auth");

// Get all Reviews of the Current User
// router.get('/current', requireAuth, async (req, res) => {
//     try {
//         const currentUser = parseInt(req.user.dataValues.id);

//         const reviews = await Review.findAll({
//             where: {
//                 userId: currentUser
//             },
//             include: [
//                 {
//                     model: User,
//                     attributes: ['id', 'firstName', 'lastName']
//                 },
//                 {
//                     model: Spot,
//                     attributes: ['id', 'ownerId', 'address', 'city', 'state',
//                         'country', 'lat', 'lng', 'name', 'price'
//                     ],
//                     include: [
//                         {
//                             model: SpotImage,
//                             where: {
//                                 preview: true
//                             },
//                             attributes: ['url']
//                         }
//                     ]
//                 },
//                 {
//                     model: ReviewImage,
//                     attributes: ['id', 'url']
//                 }
//             ]
//         });

//         const formattedReviews = reviews.map(review => {
//             const reviewData = review.toJSON();

//             // Extract the previewImage if available
//             reviewData.Spot.previewImage = reviewData.Spot.SpotImages.length > 0
//                 ? reviewData.Spot.SpotImages[0].url
//                 : null;

//             // Remove SpotImages from the response if not needed
//             delete reviewData.Spot.SpotImages;

//             return reviewData;
//         });

//         res.json({ Reviews: formattedReviews });
//     } catch (err) {
//         res.status(500).json({ message: "Error fetching all Reviews from current User" })
//     }
// });

router.get("/current", requireAuth, async (req, res) => {
  try {
    const currentUser = parseInt(req.user.id);

    console.log(currentUser);

    // Fetch all reviews for the current user
    const reviews = await Review.findAll({
      where: {
        userId: currentUser,
      },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Spot,
          attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "price"],
          include: [
            {
              model: SpotImage,
              where: {
                preview: true,
              },
              attributes: ["url"],
              required: false, // Allow spots without preview images
            },
          ],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    // Format the reviews response
    const formattedReviews = reviews.map((review) => {
      const reviewData = review.toJSON();

      // Safely extract the previewImage if available
      reviewData.Spot.previewImage = reviewData.Spot.SpotImages && reviewData.Spot.SpotImages.length > 0 ? reviewData.Spot.SpotImages[0].url : null;

      // Remove SpotImages from the response as it's no longer needed
      delete reviewData.Spot.SpotImages;

      return reviewData;
    });

    // Send the response
    res.status(200).json({ Reviews: formattedReviews });
  } catch (err) {
    console.error("Error fetching reviews:", err.message); // Log the error for debugging
    res.status(500).json({ message: "Error fetching all Reviews from current User", error: err.message });
  }
});

// Add an Image to a Review based on the Review's id
router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const { url } = req.body;
  const reviewId = req.params.reviewId;

  if (!url) {
    return res.status(400).json({ message: "Image URL is required" });
  }

  try {
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: "User is not authorized to add an image to this review" });
    }

    const imageCount = await ReviewImage.count({
      where: {
        reviewId,
      },
    });

    if (imageCount >= 10) {
      return res.status(403).json({ message: "Maximum number of images for this resource was reached" });
    }

    const newImage = await ReviewImage.create({
      reviewId,
      url,
    });

    delete newImage.dataValues.reviewId;
    delete newImage.dataValues.createdAt;
    delete newImage.dataValues.updatedAt;

    res.status(201).json(newImage);
  } catch (err) {
    res.status(500).json({ message: "An error occurred while uploading the image" });
  }
});

// Edit a Review
router.put("/:reviewId", requireAuth, async (req, res) => {
  const { review, stars } = req.body;
  const reviewId = req.params.reviewId;

  const errors = {};

  if (!review) {
    errors.review = "Review text is required";
  }

  if (stars === undefined || stars < 1 || stars > 5) {
    errors.stars = "Stars must be an integer from 1 to 5";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Bad request",
      errors,
    });
  }

  try {
    const existingReview = await Review.findByPk(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    if (existingReview.userId !== req.user.id) {
      return res.status(403).json({ message: "User is not authorized to edit this review" });
    }

    existingReview.review = review;
    existingReview.stars = stars;

    await existingReview.save();

    res.status(200).json(existingReview);
  } catch (err) {
    res.status(500).json({ message: "An error occured while updating the review" });
  }
});

// Delete a Review
router.delete("/:reviewId", requireAuth, async (req, res) => {
  const reviewId = req.params.reviewId;

  try {
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: "User is not authorized to delete this review" });
    }

    await review.destroy();

    res.status(200).json({ message: "Successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred while deleting the review" });
  }
});

module.exports = router;
