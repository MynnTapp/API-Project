const express = require("express");
const router = express.Router();
const Spot = require("../models/Spot");
const { requireAuth } = require("../../utils/auth");

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
    const spots = await Spot.findAll({
      attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "description", "price", "createdAt", "updatedAt", "previewImage", "avgRating"],
    });

    res.json(spots);
  } catch (err) {
    res.status(500).json({ message: "Error fetching spots" });
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

    const numReviews = await Review.count({ where: { spotId } });
    const avgStarRating = await Review.average("starRating", { where: { spotId } });

    spot.dataValues.numReviews = numReviews;
    spot.dataValues.avgStarRating = avgStarRating;

    res.json(spot);
  } catch (err) {
    res.status(500).json({ message: "Error fetching spot" });
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

    const numReviews = await Review.count({ where: { spotId } });
    const avgStarRating = await Review.average("starRating", { where: { spotId } });

    spot.dataValues.numReviews = numReviews;
    spot.dataValues.avgStarRating = avgStarRating;

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
      attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "description", "price", "createdAt", "updatedAt", "previewImage"],
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
