const express = require("express");
const router = express.Router();
const { Spot, Review, ReviewImage, SpotImage, User } = require("../../db/models");
const { Sequelize } = require('sequelize');

const { setTokenCookie, requireAuth } = require("../../utils/auth.js");

router.post("/", requireAuth, async (req, res) => {
  try {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    // Validate the request body
    if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    if (typeof lat !== "number" || typeof lng !== "number" || typeof price !== "number") {
      return res.status(400).json({ message: "Invalid data type" });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    const newSpot = await Spot.create({
      ownerId: req.user.id,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });

    res.json(newSpot);
  } catch (err) {
    res.status(500).json({ message: "Error creating spot" });
  }
});

// GET all Spots
router.get("/", async (req, res) => {
  try {
    const spots = await Spot.findAll();

    res.json({ Spots: spots });
  } catch (err) {
    res.status(500).json({ message: "Error fetching spots" });
  }
});

// Add an Image to Spot with Spot's ID
router.post("/:spotId/images", async (req, res) => {
  const { url, preview } = req.body;

  const spotId = req.params.spotId;

  try {
    // Find the spot by its primary key (ID)
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(400).json({ message: "Spot can't be found" });
    }

    // Check if the current user owns the spot
    // if (spot.ownerId !== req.user.id) {
    //   return res.status(403).json({ message: "User is not authorized to add an image to this spot" });
    // }
    const imageData = await SpotImage.create({ url, preview, spotId });
    // Create the image associated with the spot

    // Return the newly created image data
    res.status(201).json(imageData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred while uploading the image" });
  }

  // if (spot.userId === req.user.id) {
  //   const newSpotImage = await SpotImage.create({ spotId, url, preview });

  //   return res.status(201).json(newSpotImage);
  // }

  // return res.status(404).json({ message: "Spot couldn't be found" });
});

// GET all Spots of current User
router.get("/current", requireAuth, async (req, res) => {
  try {
    const currentUser = parseInt(req.user.dataValues.id);

    const spots = await Spot.findAll({
      where: {
        ownerId: currentUser
      },
      attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country',
        'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt',
        [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgRating']
      ],
      include: [
        {
          model: Review,
          attributes: []
        },
        {
          model: SpotImage,
          where: {
            preview: true
          },
          attributes: ['url']
        }
      ]
    });
  
    const formattedSpots = spots.map(spot => {
      const spotData = spot.toJSON();
  
      spotData.previewImage = spotData.SpotImages.length > 0
        ? spotData.SpotImages[0].url
        : null;
  
      delete spotData.SpotImages;
  
      return spotData;
    });
  
    res.json({ Spots: formattedSpots });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching Spots for current User" });
  }
});

// Add a Spot
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const spotId = req.params.id;
    const userId = req.user.id;
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot not found" });
    }

    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized to edit spot" });
    }

    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    // Validate the request body
    if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    if (typeof lat !== "number" || typeof lng !== "number" || typeof price !== "number") {
      return res.status(400).json({ message: "Invalid data type" });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    await spot.update({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    });

    res.json(spot);
  } catch (err) {
    res.status(500).json({ message: "Error updating spot" });
  }
});

// DELETE a Spot
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const spotId = req.params.id;
    const userId = req.user.id;
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot not found" });
    }

    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete spot" });
    }

    await spot.destroy();

    res.status(204).json({ message: "Spot deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting spot" });
  }
});

// GET a Spot from an id
router.get("/:spotId", requireAuth, async (req, res) => {
  try {
    const spotId = parseInt(req.params.spotId);
    const spot = await Spot.findOne({
      where: {
        id: spotId
      },
      attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'description', 'price', 'createdAt', 'updatedAt',
        [Sequelize.fn('COUNT', Sequelize.col('Reviews.id')), 'numReviews'],
        [Sequelize.fn('AVG', Sequelize.col('Reviews.stars')), 'avgStarRating']
      ],
      include: [
        {
          model: SpotImage,
          attributes: ['id', 'url', 'preview']
        },
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Review,
          attributes: []
        }
      ]
    });

    console.log('TESTING HERE');
    console.log(spot);
    console.log('TESTING ENDS');

    if(!spot.dataValues.id) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }
  
    res.json({Spot: spot});
  } catch (err) {
    res.status(500).json({ message: "Error fetching spot from an id" });
  }
});

// GET all Spots from a User's id
router.get("/spots/:userId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const spots = await Spot.findAll({
      where: { ownerId: userId },
      attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "description", "price", "createdAt", "updatedAt"],
      include: [
        {
          model: Review,
          attributes: [],
          required: false,
        },
      ],
    });

    const spotsWithAvgRating = await Promise.all(
      spots.map(async (spot) => {
        const avgRating = await Review.average("starRating", {
          where: { spotId: spot.id },
        });
        spot.dataValues.avgRating = avgRating;
        return spot;
      })
    );

    res.json(spotsWithAvgRating);
  } catch (err) {
    res.status(500).json({ message: "Error fetching spots" });
  }
});

// Get all Reviews by a Spot's id
router.get('/:spotId/reviews', async (req, res) => {
  try {
    const spotId = parseInt(req.params.spotId);

    const reviews = await Review.findAll({
      where: {
        spotId
      },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: ReviewImage,
          attributes: ['id', 'url']
        }
      ]
    });

    if(reviews.length === 0) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }
  
    res.json({ Reviews: reviews });
  } catch (err) {
    res.status(500).json({ message: "Error fetching all Reviews with Spot's id" });
  }
});

// Create a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', requireAuth, async (req, res) => {
  const { review, stars } = req.body;
  const spotId = parseInt(req.params.spotId);
  const errors = {};

  if(!review) {
    errors.review = "Review text is required";
  }

  if(stars === undefined || stars < 1 || stars > 5) {
    errors.stars = "Stars must be an integer from 1 to 5";
  }

  if(Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: 'Bad request',
      errors
    });
  }

  const spot = await Spot.findOne({
    where: {
      id: spotId
    },
    attributes: ['id']
  });

  if(!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const existingReview = await Review.findOne({
    where: {
      userId: req.user.id,
      spotId
    }
  });

  console.log(req.user);

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
});

module.exports = router;
