const express = require("express");
const router = express.Router();
const Spot = require("../models/Spot");
const { requireAuth } = require("../../utils/auth");

router.post("/", requireAuth, async (req, res) => {
  try {
    const spot = await Spot.create(req.body);
    res.status(201).send(spot);
  } catch (error) {
    res.status(400).send({ message: "Error creating spot" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const spots = await Spot.findAll();
    res.send(spots);
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
