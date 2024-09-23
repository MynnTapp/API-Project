const express = require('express');
const router = express.Router();
const { Review, ReviewImage } = require('../../db/models');

const { requireAuth } = require('../../utils/auth');

// Delete a Review Image
router.delete('/reviews-images/:imageId', requireAuth, async (req, res) => {
    const imageId = req.params.imageId; 

    try {
        const reviewImage = await ReviewImage.findByPk(imageId);

        if(!reviewImage) {
            return res.status(404).json({ message: "Review Image couldn't be found" });
        }

        const review = await Review.findByPk(reviewImage.reviewId);

        if(!review || review.userId !== req.user.id) {
            return res.status(403).json({ message: "User is not authorized to delete this review image" });
        }

        await reviewImage.destroy();

        res.status(200).json({ message: "Successfully deleted" });
    } catch (err) {
        res.status(500).json({ message: "An error occurred while deleting the review image" });
    }
});

module.exports = router;