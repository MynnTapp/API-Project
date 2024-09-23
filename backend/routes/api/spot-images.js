const express = require("express");
const app = express();
const authMiddleware = require("../utils/auth");

router.use(authMiddleware.authenticate);

app.post("/api/spots/:spotId/images", (res, req) => {
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
