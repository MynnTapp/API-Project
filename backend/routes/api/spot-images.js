const express = require("express");
const app = express();
const authMiddleware = require("../utils/auth");
const spotImage = require("../models/SpotImages");

router.use(authMiddleware.authenticate);

app.post("/api/spots/:spotId/images", requireAuth, (res, req) => {
  const spotId = req.params.spotId;
  const image = req.body;
  const db = req.db;
  db.collection("spots").updateOne(
    { _id: spotId },
    {
      $push: {
        images: image,
      },
    },
    (err) => {
      if (err) {
        res.status(500).send({ message: "Error updating spot" });
      } else {
        res.send({ message: "Spot updated successfully" });
      }
    }
  );
});

app.delete("/api/spots/:spotId/images", async (req, res) => {
  const spotId = req.params.spotId;
  const findSpot = await spotImage.findbypk(spotId);
  if (!findSpot) {
    return res.status(404).send({ message: "Spot image not found" });
  }
  const imageId = req.body.imageId;
  const deleteImage = await spotImage.deleteImage(spotId, imageId);
  if (!deleteImage) {
    return res.status(404).send({ message: "Spot image not found" });
  }
  res.send({ message: "Spot image deleted successfully" });
});
