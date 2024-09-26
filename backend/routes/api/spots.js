const express = require("express");
const router = express.Router();
const { Spot, Review, SpotImage } = require("../../db/models");
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

router.get("/", async (req, res) => {
  try {
    const spots = await Spot.findAll();

    res.json({ Spots: spots });
  } catch (err) {
    res.status(500).json({ message: "Error fetching spots" });
  }
});

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

router.get("/current", requireAuth, async (req, res) => {
  try {
    const currentUser = req.user;

    const spots = await Spot.findAll({
      where: {
        ownerId: currentUser.id,
      },
      include: [
        {
          model: Review,
          attributes: []
        },
        {
          model: SpotImage,
          as: 'previewImage',
          attributes: ['url'],
          where: {
            preview: true
          },
          required: false
        }
      ],
      attributes: {
        include: [
          [
            Sequelize.fn("AVG", Sequelize.col("Reviews.stars")),
            "avgRating"
          ],
        ]
      },
      group: ['Spot.id', 'previewImage.id']
    });

    const formattedSpots = spots.map(spot => {
      spot.previewImage = (spot.previewImage[0].dataValues.url);
      return spot
    });

    res.json({ Spots: formattedSpots})
  } catch (err) {
    res.status(500).json({ message: "Error fetching spots for current User" });
  }
});

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

router.get("/:id", async (req, res) => {
  try {
    const spotId = req.params.id;
    const spot = await Spot.findByPk(spotId, {
      attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "description", "price", "createdAt", "updatedAt"],
      include: [
        {
          model: SpotImage,
          attributes: ["id", "url", "preview"],
        },
        {
          model: Owner,
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot not found" });
    }

    res.json(spot);
  } catch (err) {
    res.status(500).json({ message: "Error fetching spot" });
  }
});

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

module.exports = router;
