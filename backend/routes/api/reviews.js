const express = require('express');
const router = express.Router();
const { Review, User, Spot, ReviewImage } = require('../../db/models');

const { requireAuth } =  require('../../utils/auth');

// Get all Reviews of the Current User
router.get('/reviews/current', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        const reviews = await Review.findAll({
            where: {
                userId
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Spot,
                    attributes: [
                        'id', 'ownerId', 'address', 'city', 'state',
                        'country', 'lat', 'lng', 'name', 'price', 'previewImage'
                    ]
                },
                {
                    model: ReviewImage,
                    attributes: ['id', 'url']
                }
            ]
        });

        res.status(200).json({ Reviews: reviews});
    } catch (err) {
        res.status(404).json({ message: "Reviews couldn't be found" });
    }
});

// Get all Reviews by a Spot's id
router.get('/spots/:spotId/reviews', async (req, res) => {
    try {
        const spotId = req.params.spotId;

        const reviews = await Review.findAll({
            where: {
                spotId
            },
            includes: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: ReviewImages,
                    attributes: ['id', 'url']
                }
            ]
        });

        res.status(200).json({ Reviews: reviews})
    } catch (err) {
        res.status(404).json({ message: "Spot couldn't be found" });
    }
});

// Create a Review for a Spot based on the Spot's id
router.post('/spots/:spotId/reviews', requireAuth, async (req, res) => {
    const { review, stars } = req.body;
    const spotId = req.params.spotId;

    const errors = {};

    if(!review) {
        errors.review = "Review text is required";
    }
    if(stars === undefined || stars < 1 || stars > 5) {
        errors.stars = "Stars must be an integer from 1 to 5";
    }

    if(Object.keys(errors).length > 0) {
        return res.status(400).json({ 
            message: "Bad request",
            errors
        });
    }

    try {
        const spot = await Spot.findByPk(spotId);

        if(!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        const existingReview = await Review.findOne({
            where: {
                userId: req.user.id,
                spotId
            }
        });

        if(existingReview) {
            return res.status(500).json({ message: "User already has a review for this spot" });
        }

        const newReview = await Review.create({
            userId: req.user.id,
            spotId,
            review,
            stars
        });

        res.status(201).json(newReview);
    } catch (err) {
        res.status(500).json({ message: "An error occurred while creating the review" });
    }
});

// Add an Image to a Review based on the Review's id
router.post('/reviews/:reviewId/images', requireAuth, async (req, res) => {
    const { url } = req.body;
    const reviewId = req.params.reviewId;

    if(!url) {
        return res.status(400).json({ message: "Image URL is required" });
    }

    try {
        const review = await Review.findByPk(reviewId);

        if(!review) {
            return res.status(404).json({ message: "Review couldn't be found" });
        }

        if(review.userId !== req.user.id) {
            return res.status(403).json({ message: "User is not authorized to add an image to this review" });
        }

        const imageCount = await ReviewImage.count({
            where: {
                reviewId
            }
        });

        if(imageCount >= 10) {
            return res.status(403).json({ message: "Maximum number of images for this resource was reached" });
        }

        const newImage = await ReviewImage.create({
            reviewId,
            url
        });

        res.status(201).json(newImage);
    } catch (err) {
        res.status(500).json({ message: "An error occurred while uploading the image" });
    }
});

// Edit a Review
router.put('reviews/:reviewId', requireAuth, async (req, res) => {
    const { review, stars } = req.body;
    const reviewId = req.params.reviewId;

    const errors = {};

    if(!review) {
        errors.review({ message: "Review text is required" });
    }

    if(stars === undefined || stars < 1 || stars > 5) {
        errors.stars({ message: "Stars must be an integer from 1 to 5" });
    }

    if(Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: "Bad request",
            errors
        });
    }

    try {
        const existingReview = await Review.findByPk(reviewId);

        if(!existingReview) {
            return res.status(404).json({ message: "Review couldn't be found" });
        }

        if(existingReview.userId !== req.user.id) {
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
router.delete('/reviews/:reviewId', requireAuth, async (req, res) => {
    const reviewId = req.params.reviewId;

    try {
        const review = await Review.findByPk(reviewId);

        if(!review) {
            return res.status(404).jjson({ message: "Review couldn't be found" });
        }

        if(review.userId !== req.user.id) {
            return res.status(403).json({ message: "User is not authorized to delete this review" });
        }

        await review.destroy();

        res.status(200).json({ message: "Successfully deleted" });
    } catch (err) {
        res.status(500).json({ message: "An error occurred while deleting teh review" });
    }
});

module.exports = router;