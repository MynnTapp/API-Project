const express = require("express");
const { SpotImage } = require("../../db/models");
const { requireAuth } = require("../../utils/auth.js");
const router = express.Router();
const { Spot } = require("../../db/models");

router.delete("spots/:spotId/images", async (req, res) => {
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

module.exports = router;
