const express = require("express");
const router = express.Router();
const { Spot, Review, ReviewImage, SpotImage, User, Booking } = require("../../db/models");
const { Sequelize, Op } = require("sequelize");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const { setTokenCookie, requireAuth } = require("../../utils/auth.js");

const ValidateSpotEdit = [
  check("address").exists({ checkFalsy: true }).withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  check("country").exists({ checkFalsy: true }).withMessage("Country is required"),
  check("lat").exists({ checkFalsy: true }).isNumeric().withMessage("Latitude is not valid"),
  check("lng").exists({ checkFalsy: true }).isNumeric().withMessage("Longitude is not valid"),
  check("name").exists({ checkFalsy: true }).withMessage("Name must be less than 50 characters"),
  check("description").exists({ checkFalsy: true }).withMessage("Description is required"),
  check("price").exists({ checkFalsy: true }).isNumeric().withMessage("Price per day is required"),
  handleValidationErrors,
];

// router.post("/", requireAuth, async (req, res) => {
//   try {
//     const { address, city, state, country, lat, lng, name, description, price } = req.body;

//     // Validate the request body
//     if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
//       return res.status(400).json({ message: "Invalid request body" });
//     }

//     if (typeof lat !== "number" || typeof lng !== "number" || typeof price !== "number") {
//       return res.status(400).json({ message: "Invalid data type" });
//     }

//     if (price < 0) {
//       return res.status(400).json({ message: "Price cannot be negative" });
//     }

//     const newSpot = await Spot.create({
//       ownerId: req.user.id,
//       address,
//       city,
//       state,
//       country,
//       lat,
//       lng,
//       name,
//       description,
//       price,
//     });

//     res.status(201).json(newSpot);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating spot" });
//   }
// });

//create a spot

router.post("/", requireAuth, async (req, res) => {
  try {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    // Validate the request body to ensure all required fields are present
    if (!address || !city || !state || !country || lat === undefined || lng === undefined || !name || !description || price === undefined) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Validate data types
    if (typeof lat !== "number" || typeof lng !== "number" || typeof price !== "number") {
      return res.status(400).json({ message: "Invalid data type for lat, lng, or price" });
    }

    // Validate that price is non-negative
    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    // Create a new spot
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

    // Return the newly created spot with a status of 201 (Created)
    return res.status(201).json(newSpot);
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: "Error creating spot", error: err.message });
  }
});

// GET all Spots
// Add Query Filters to GET all Spots
// GET all Spots

// router.get("/", async (req, res) => {
//   const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

//   let errors = {};
//   if (page < 1) errors.page = "Page must be greater than or equal to 1";
//   if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
//   if (minLat && isNaN(minLat)) errors.minLat = "Minimum latitude is invalid";
//   if (maxLat && isNaN(maxLat)) errors.maxLat = "Maximum latitude is invalid";
//   if (minLng && isNaN(minLng)) errors.minLng = "Minimum longitude is invalid";
//   if (maxLng && isNaN(maxLng)) errors.maxLng = "Maximum longitude is invalid";
//   if (minPrice && (isNaN(minPrice) || minPrice < 0)) errors.minPrice = "Minimum price must be greater than or equal to 0";
//   if (maxPrice && (isNaN(maxPrice) || maxPrice < 0)) errors.maxPrice = "Maximum price must be greater than or equal to 0";

//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({
//       message: "Bad request",
//       errors,
//     });
//   }

//   const limit = parseInt(size);
//   const offset = limit * (parseInt(page) - 1);

//   let where = {};

//   if (minLat) where.lat = { [Op.gte]: parseFloat(minLat) };
//   if (maxLat) where.lat = { ...where.lat, [Op.lte]: parseFloat(maxLat) };
//   if (minLng) where.lng = { [Op.gte]: parseFloat(minLng) };
//   if (maxLng) where.lng = { ...where.lng, [Op.lte]: parseFloat(maxLng) };
//   if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
//   if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

//   try {
//     const spots = await Spot.findAll({
//       where,
//       attributes: [
//         "id",
//         "ownerId",
//         "address",
//         "city",
//         "state",
//         "country",
//         "lat",
//         "lng",
//         "name",
//         "description",
//         "price",
//         "createdAt",
//         "updatedAt",
//         [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgRating"],
//       ],
//       include: [
//         {
//           model: Review,
//           attributes: [],
//         },
//         {
//           model: SpotImage,
//           required: false, // Ensure spots without images are included
//           where: { preview: true },
//           attributes: ["url"],
//         },
//       ],
//       limit,
//       offset,
//       group: ["Spot.id", "SpotImages.id"],
//       subQuery: false,
//     });

//     if (spots.length === 0) {
//       return res.status(200).json({
//         Spots: [],
//         page: parseInt(page),
//         size: limit,
//       });
//     }

//     const formattedSpots = spots.map((spot) => {
//       const spotData = spot.toJSON();
//       spotData.previewImage = spotData.SpotImages && spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
//       delete spotData.SpotImages;
//       return spotData;
//     });

//     res.status(200).json({
//       Spots: formattedSpots,
//       page: parseInt(page),
//       size: limit,
//     });
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(500).json({
//       message: "Error fetching spots",
//       error: error.message, // Return the error message
//     });
//   }
// });

// router.get("/", async (req, res) => {
//   const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

//   let errors = {};

//   // Parse latitude and longitude as numbers
//   const parsedMinLat = minLat ? parseFloat(minLat) : undefined;
//   const parsedMaxLat = maxLat ? parseFloat(maxLat) : undefined;
//   const parsedMinLng = minLng ? parseFloat(minLng) : undefined;
//   const parsedMaxLng = maxLng ? parseFloat(maxLng) : undefined;

//   // Validation
//   if (page < 1) errors.page = "Page must be greater than or equal to 1";
//   if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
//   if (parsedMinLat && isNaN(parsedMinLat)) errors.minLat = "Minimum latitude is invalid";
//   if (parsedMaxLat && isNaN(parsedMaxLat)) errors.maxLat = "Maximum latitude is invalid";
//   if (parsedMinLng && isNaN(parsedMinLng)) errors.minLng = "Minimum longitude is invalid";
//   if (parsedMaxLng && isNaN(parsedMaxLng)) errors.maxLng = "Maximum longitude is invalid";
//   if (minPrice && (isNaN(minPrice) || minPrice < 0)) errors.minPrice = "Minimum price must be greater than or equal to 0";
//   if (maxPrice && (isNaN(maxPrice) || maxPrice < 0)) errors.maxPrice = "Maximum price must be greater than or equal to 0";

//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({
//       message: "Bad request",
//       errors,
//     });
//   }

//   const limit = parseInt(size);
//   const offset = limit * (parseInt(page) - 1);

//   let where = {};

//   // Use parsed values for latitude and longitude filters
//   if (parsedMinLat) where.lat = { [Op.gte]: parsedMinLat };
//   if (parsedMaxLat) where.lat = { ...where.lat, [Op.lte]: parsedMaxLat };
//   if (parsedMinLng) where.lng = { [Op.gte]: parsedMinLng };
//   if (parsedMaxLng) where.lng = { ...where.lng, [Op.lte]: parsedMaxLng };
//   if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
//   if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

//   try {
//     const spots = await Spot.findAll({
//       where,
//       attributes: [
//         "id",
//         "ownerId",
//         "address",
//         "city",
//         "state",
//         "country",
//         "lat",
//         "lng",
//         "name",
//         "description",
//         "price",
//         "createdAt",
//         "updatedAt",
//         [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgRating"],
//       ],
//       include: [
//         {
//           model: Review,
//           attributes: [], // Don't return reviews
//         },
//         {
//           model: SpotImage,
//           required: false, // Allow spots without preview images
//           where: { preview: true },
//           attributes: ["url"],
//         },
//       ],
//       limit,
//       offset,
//       group: ["Spot.id"],
//       subQuery: false,
//     });

//     const formattedSpots = spots.map((spot) => {
//       const spotData = spot.toJSON();
//       spotData.previewImage = spotData.SpotImages && spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
//       delete spotData.SpotImages;
//       return spotData;
//     });

//     res.status(200).json({
//       Spots: formattedSpots,
//       page: parseInt(page),
//       size: limit,
//     });
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(500).json({
//       message: "Error fetching spots",
//       error: error.message, // Return the error message
//     });
//   }
// });

router.get("/", requireAuth, async (req, res) => {
  try {
    const currentUser = req.user.id; // Assuming req.user.id is available

    const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

    // const { page = 1, size = 20 } = req.query;

    let errors = {};
    if (page < 1) errors.page = "Page must be greater than or equal to 1";
    if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
    if (minLat && isNaN(minLat) /*&& minLat >= -90 && minLat <= 90*/) errors.minLat = "Minimum latitude is invalid";
    if (maxLat && isNaN(maxLat) /*&& maxLat >= -90 && maxLat <= 90*/) errors.maxLat = "Maximum latitude is invalid";
    if (minLng && isNaN(minLng) /*&& minLng >= -180 && minLng <= 180*/) errors.minLng = "Minimum longitude is invalid";
    if (maxLng && isNaN(maxLng) /*&& maxLng >= -180 && maxLng <= 180*/) errors.maxLng = "Maximum longitude is invalid";
    // if (minPrice && (isNaN(minPrice) || minPrice < 0)) errors.minPrice = "Minimum price must be greater than or equal to 0";
    // if (maxPrice && (isNaN(maxPrice) || maxPrice < 0)) errors.maxPrice = "Maximum price must be greater than or equal to 0";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Bad Request",
        errors,
      });
    }

    // TEST
    console.log("TEST");
    console.log(errors);

    // Parse latitude and longitude as numbers
    const parsedMinLat = minLat ? parseFloat(minLat) : undefined;
    const parsedMaxLat = maxLat ? parseFloat(maxLat) : undefined;
    const parsedMinLng = minLng ? parseFloat(minLng) : undefined;
    const parsedMaxLng = maxLng ? parseFloat(maxLng) : undefined;

    const limit = parseInt(size);
    const offset = limit * (parseInt(page) - 1);

    let where = {};
    where.ownerId = currentUser;

    // Use parsed values for latitude and longitude filters
    if (parsedMinLat) where.lat = { [Op.gte]: parsedMinLat };
    if (parsedMaxLat) where.lat = { ...where.lat, [Op.lte]: parsedMaxLat };
    if (parsedMinLng) where.lng = { [Op.gte]: parsedMinLng };
    if (parsedMaxLng) where.lng = { ...where.lng, [Op.lte]: parsedMaxLng };
    // if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
    // if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

    const spots = await Spot.findAll({
      where,
      attributes: [
        "id",
        "ownerId",
        "address",
        "city",
        "state",
        "country",
        "lat",
        "lng",
        "name",
        "description",
        "price",
        "createdAt",
        "updatedAt",
        [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgRating"],
      ],
      include: [
        {
          model: Review,
          attributes: [], // No need to select any review attributes
        },
        {
          model: SpotImage,
          where: {
            preview: true,
          },
          attributes: ["id", "url"], // SpotImage attributes
          required: false, // Allow spots without preview images
        },
      ],
      limit,
      offset,
      group: ["Spot.id", "SpotImages.id"], // Include SpotImages.id in GROUP BY clause
    });

    // Format the response
    const formattedSpots = spots.map((spot) => {
      const spotData = spot.toJSON();
      spotData.previewImage = spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
      delete spotData.SpotImages;
      return spotData;
    });

    res.status(200).json({ Spots: formattedSpots });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Error fetching spots", error: err.message });
  }
});

// Add an Image to Spot with Spot's ID
router.post("/:spotId/images", requireAuth, async (req, res) => {
  const { url, preview } = req.body;

  const spotId = req.params.spotId;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Ensure req.user is defined
    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "User is not authorized to add an image to this spot" });
    }
    // if (spot.ownerId === spotId) {
    const imageData = await SpotImage.create({ url, preview, spotId });
    const { createdAt, updatedAt, spotId: removedSpotId, ...imageWithoutTimestamps } = imageData.get({ plain: true });
    res.status(201).json(imageWithoutTimestamps);
    //}
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "An error occurred while uploading the image" });
  }

  // try {
  //   // Find the spot by its primary key (ID)
  //   const spot = await Spot.findByPk(spotId);
  //   if (!spot) {
  //     return res.status(400).json({ message: "Spot can't be found" });
  //   }

  //   //Check if the current user owns the spot
  //   // if (spot.ownerId !== req.user.id) {
  //   //   return res.status(403).json({ message: "User is not authorized to add an image to this spot" });
  //   // }
  //   const imageData = await SpotImage.create({ url, preview, spotId });
  //   console.log(imageData);
  //   // Create the image associated with the spot

  //   // Return the newly created image data
  //   res.status(201).json(imageData);
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ message: "An error occurred while uploading the image" });
  // }

  // if (spot.userId === req.user.id) {
  //   const newSpotImage = await SpotImage.create({ spotId, url, preview });

  //   return res.status(201).json(newSpotImage);
  // }

  // return res.status(404).json({ message: "Spot couldn't be found" });
});

// GET all Spots of current User
// router.get("/current", requireAuth, async (req, res) => {
//   try {
//     const currentUser = req.user.id; // Assuming req.user.id is available

//     const spots = await Spot.findAll({
//       where: {
//         ownerId: currentUser,
//       },
//       attributes: [
//         "id",
//         "ownerId",
//         "address",
//         "city",
//         "state",
//         "country",
//         "lat",
//         "lng",
//         "name",
//         "description",
//         "price",
//         "createdAt",
//         "updatedAt",
//         [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgRating"],
//       ],
//       include: [
//         {
//           model: Review,
//           attributes: [],
//         },
//         {
//           model: SpotImage,
//           where: {
//             preview: true,
//           },
//           attributes: ["url"],
//           required: false, // Allow spots without preview images
//         },
//       ],
//       group: ["Spot.id"], // Group only by Spot ID
//       group: ["Spot.id"],
//     });

//     console.log(spots);

//     const formattedSpots = spots.map((spot) => {
//       const spotData = spot.toJSON();
//       spotData.previewImage = spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
//       delete spotData.SpotImages;
//       return spotData;
//     });

//     res.json({ Spots: formattedSpots });
//   } catch (err) {
//     return res.status(500).json({ message: "Error fetching Spots for current User" });
//   }
// });

router.get("/current", requireAuth, async (req, res) => {
  try {
    const currentUser = req.user.id; // Assuming req.user.id is available

    const spots = await Spot.findAll({
      where: {
        ownerId: currentUser,
      },
      attributes: [
        "id",
        "ownerId",
        "address",
        "city",
        "state",
        "country",
        "lat",
        "lng",
        "name",
        "description",
        "price",
        "createdAt",
        "updatedAt",
        [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgRating"],
      ],
      include: [
        {
          model: Review,
          attributes: [], // Don't return reviews
        },
        {
          model: SpotImage,
          where: {
            preview: true, // Only get preview images
          },
          attributes: ["url"],
          required: false, // Allow spots without preview images
        },
      ],
      group: ["Spot.id", "SpotImages.id"], // Group by Spot.id and SpotImages.id to avoid duplicates
    });

    const formattedSpots = spots.map((spot) => {
      const spotData = spot.toJSON();
      spotData.previewImage = spotData.SpotImages && spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
      delete spotData.SpotImages;
      return spotData;
    });

    // Return 200 status with the formatted spots in the response
    return res.status(200).json({
      Spots: formattedSpots,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: "Error fetching Spots for current User" });
  }
});

// update a Spot
router.put("/:id", requireAuth, ValidateSpotEdit, async (req, res) => {
  const spotId = req.params.id;
  try {
    const userId = req.user.id;
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized to edit spot" });
    }

    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    //Validate the request body
    if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    if (typeof lat !== "number" || typeof lng !== "number" || typeof price !== "number") {
      return res.status(400).json({ message: "Invalid data type" });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    const updatedSpot = await spot.update({
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

    const { spotId: noId, ...spotWithoutId } = updatedSpot.get({ plain: true });

    res.status(200).json(spotWithoutId);
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
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    if (spot.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete spot" });
    }

    await spot.destroy();

    res.status(200).json({ message: "Successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting spot" });
  }
});

// GET a Spot from an id
// GET a Spot from an id
// router.get("/:spotId", async (req, res) => {
//   try {
//     const spotId = parseInt(req.params.spotId);
//     const spot = await Spot.findOne({
//       where: {
//         id: spotId,
//       },
//       attributes: [
//         "id",
//         "ownerId",
//         "address",
//         "city",
//         "state",
//         "country",
//         "lat",
//         "lng",
//         "name",
//         "description",
//         "price",
//         "createdAt",
//         "updatedAt",
//         [Sequelize.fn("COUNT", Sequelize.col("Reviews.id")), "numReviews"],
//         [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgStarRating"],
//       ],
//       include: [
//         {
//           model: SpotImage,
//           attributes: ["id", "url", "preview"],
//         },
//         {
//           model: User,
//           as: "Owner",
//           attributes: ["id", "firstName", "lastName"],
//         },
//         {
//           model: Review,
//           attributes: [],
//         },
//       ],
//       group: ["Spot.id", "SpotImages.id", "Owner.id"],
//     });

//     if (!spot) {
//       return res.status(404).json({ message: "Spot couldn't be found" });
//     }

//     res.status(200).json({ Spot: spot });
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(500).json({
//       message: "Error fetching spot from an id",
//       error: error.message, // Return the error message
//     });
//   }
// });

// // GET all Spots from a User's id
// router.get("/spots/:userId", requireAuth, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const spots = await Spot.findAll({
//       where: { ownerId: userId },
//       attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "description", "price", "createdAt", "updatedAt"],
//       include: [
//         {
//           model: Review,
//           attributes: [],
//           required: false,
//         },
//       ],
//     });

//     const spotsWithAvgRating = await Promise.all(
//       spots.map(async (spot) => {
//         const avgRating = await Review.average("starRating", {
//           where: { spotId: spot.id },
//         });
//         spot.dataValues.avgRating = avgRating;
//         return spot;
//       })
//     );

//     res.json(spotsWithAvgRating);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching spots" });
//   }
// });

router.get("/:spotId", async (req, res) => {
  try {
    const spotId = parseInt(req.params.spotId);

    const spot = await Spot.findOne({
      where: {
        id: spotId,
      },
      attributes: [
        "id",
        "ownerId",
        "address",
        "city",
        "state",
        "country",
        "lat",
        "lng",
        "name",
        "description",
        "price",
        "createdAt",
        "updatedAt",
        [Sequelize.fn("COUNT", Sequelize.col("Reviews.id")), "numReviews"],
        [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgStarRating"],
      ],
      include: [
        {
          model: SpotImage,
          attributes: ["id", "url", "preview"],
        },
        {
          model: User,
          as: "Owner",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Review,
          attributes: [], // Only count and average needed
        },
      ],
      group: ["Spot.id", "SpotImages.id", "Owner.id"],
    });

    // If the spot doesn't exist
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Flattening the response: removing the "Spot" key nesting
    const spotData = spot.toJSON();
    res.status(200).json(spotData);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      message: "Error fetching spot from an id",
      error: error.message, // Return the error message
    });
  }
});

// Get all Reviews by a Spot's id
router.get("/:spotId/reviews", async (req, res) => {
  try {
    const spotId = parseInt(req.params.spotId);

    const reviews = await Review.findAll({
      where: {
        spotId,
      },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    if (reviews.length === 0) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    res.json({ Reviews: reviews });
  } catch (err) {
    res.status(500).json({ message: "Error fetching all Reviews with Spot's id" });
  }
});

// Create a Review for a Spot based on the Spot's id
router.post("/:spotId/reviews", requireAuth, async (req, res) => {
  const { review, stars } = req.body;
  const spotId = parseInt(req.params.spotId);
  const errors = {};

  if (!review) {
    errors.review = "Review text is required";
  }

  if (stars === undefined || stars < 1 || stars > 5) {
    errors.stars = "Stars must be an integer from 1 to 5";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Bad request",
      errors,
    });
  }

  const spot = await Spot.findOne({
    where: {
      id: spotId,
    },
    attributes: ["id"],
  });

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const existingReview = await Review.findOne({
    where: {
      userId: req.user.id,
      spotId,
    },
  });

  console.log(req.user);

  if (existingReview) {
    return res.status(500).json({ message: "User already has a review for this spot" });
  }

  const newReview = await Review.create({
    userId: req.user.id,
    spotId,
    review,
    stars,
  });

  res.status(201).json(newReview);
});

// GET all Bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const spotId = req.params.spotId;

    const spot = await Spot.findOne({
      where: {
        id: spotId,
      },
      attributes: ["id", "ownerId"],
    });

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    const bookings = await Booking.findAll({
      where: {
        spotId,
      },
      include: {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
    });

    const formattedBookings = bookings.map((booking) => {
      const bookingData = booking.toJSON();

      if (userId !== spot.ownerId) {
        return {
          spotId: bookingData.spotId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
        };
      }

      return bookingData;
    });

    res.json({ Bookings: formattedBookings });
  } catch (err) {
    res.status(500).json({ message: "Error fetching all Bookings for a Spot based on the Spot's id" });
  }
});

// Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, async (req, res) => {
  const { startDate, endDate } = req.body;
  const spotId = req.params.spotId;
  const userId = parseInt(req.user.id);

  const errors = {};

  const spot = await Spot.findOne({
    where: {
      id: spotId,
    },
    attributes: ["id", "ownerId"],
  });

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  if (spot.ownerId === userId) {
    return res.status(403).json({ message: "You cannot book your own spot" });
  }

  const currentDate = new Date();

  if (new Date(startDate) < currentDate) {
    errors.startDate = "startDate cannot be in the past";
  }
  if (new Date(endDate) <= new Date(startDate)) {
    errors.endDate = "endDate cannot be on or before startDate";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Bad Request",
      errors,
    });
  }

  const conflictingBookings = await Booking.findOne({
    where: {
      spotId,
      [Op.or]: [
        {
          startDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        {
          endDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        {
          [Op.and]: [
            {
              startDate: {
                [Op.lte]: startDate,
              },
            },
            {
              endDate: {
                [Op.gte]: endDate,
              },
            },
          ],
        },
      ],
    },
  });

  if (conflictingBookings) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflict with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }

  const newBooking = await Booking.create({
    spotId,
    userId,
    startDate,
    endDate,
  });

  res.status(201).json({
    id: newBooking.id,
    spotId: newBooking.spotId,
    userId: newBooking.userId,
    startDate: newBooking.startDate,
    endDate: newBooking.endDate,
    createdAt: newBooking.createdAt,
    updatedAt: newBooking.updatedAt,
  });
});

module.exports = router;
