const express = require("express");
const { SpotImage, Spot } = require("../../db/models");
const { requireAuth } = require("../../utils/auth.js");
const router = express.Router();

router.delete("/:imageId", requireAuth, async (req, res) => {
  const imageId = req.params.imageId;
  const userId = req.user.id;

  const spotImage = await SpotImage.findByPk(imageId);

  if(!spotImage) {
    return res.status(404).json({ message: "Spot Image couldn't be found" });
  }

  const spot = await Spot.findOne({
    where: {
      id: spotImage.spotId
    },
    attributes: ['id', 'ownerId']
  });

  if(userId !== spot.ownerId) {
    return res.status(403).json({ message: "Unauthorized to delete this image" });
  }

  try {
    await spotImage.destroy();

    res.json({ message: "Successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting SpotImage" });
  }
});

module.exports = router;
