const express = require("express");
const router = express.Router();
const Spot = require("../models/Spot");

const authMiddleware = require("../utils/auth");

router.use(authMiddleware.authenticate);

router.post("/", async (req, res) => {
  try {
    const spot = await Spot.create(req.body);
    res.status(201).send(spot);
  } catch (error) {
    res.status(400).send({ message: "Error creating spot" });
  }
});

router.get("/", async (req, res) => {
  const { page = 1, size = 10, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
  if (page < 1 || size < 1 || size > 100) {
    return res.status(400).send({ message: "Page or size is invalid" });
  }
  if (minLat && maxLat && minLat > maxLat) {
    return res.status(400).send({ message: "Latitude range is Invalid" });
  }
  if (minLng && maxLng && minLng > maxLng) {
    return res.status(400).send({ message: "Longitude range is invalid" });
  }
  if (minPrice && maxPrice && minPrice > maxPrice) {
    return res.status(400).send({ message: "Price range is Invalid" });
  }
  const options = {
    offset: (page - 1) * size,
    limit: size,
  };

  if (minLat && maxLat) {
    options.where = {
      lat: {
        [Op.gte]: minLat,
        [Op.lte]: maxLat,
      },
    };
  }
  if (minLng && maxLng) {
    options.where = {
      lng: {
        [Op.gte]: minLng,
        [Op.lte]: maxLng,
      },
    };
  }
  if (minPrice && maxPrice) {
    options.where = {
      price: {
        [Op.gte]: minPrice,
        [Op.lte]: maxPrice,
      },
    };
  }
  try {
    const spots = await Spot.findAll(options);
    const totalCount = await Spot.count(options);
    res.send({
      spots,
      page,
      size,
      totalCount,
    });
  } catch (error) {
    res.status(500).send({ message: "Error fetching spots" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const spot = await Spot.findByPk(req.params.id);
    if (!spot) {
      res.status(404).send({ message: "Spot not found" });
    } else {
      res.send(spot);
    }
  } catch (error) {
    res.status(500).send({ message: "Error fetching spot" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const spot = await Spot.findByPk(req.params.id);
    if (!spot) {
      res.status(404).send({ message: "Spot not found" });
    } else {
      await spot.update(req.body);
      res.send(spot);
    }
  } catch (error) {
    res.status(400).send({ message: "Error updating spot" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const spot = await Spot.findByPk(req.params.id);
    if (!spot) {
      res.status(404).send({ message: "Spot not found" });
    } else {
      await spot.destroy();
      res.status(204).send({ message: "Spot deleted" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error deleting spot" });
  }
});

module.exports = router;
