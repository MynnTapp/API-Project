// const express = require("express");
// const router = express.Router();
// const { Spot, Review, ReviewImage, SpotImage, User, Booking } = require("../../db/models");
// const { Sequelize, Op } = require("sequelize");
// const { check } = require("express-validator");
// const { handleValidationErrors } = require("../../utils/validation");

// const { setTokenCookie, requireAuth } = require("../../utils/auth.js");

// const ValidateSpotEdit = [
//   check("address").exists({ checkFalsy: true }).withMessage("Street address is required"),
//   check("city").exists({ checkFalsy: true }).withMessage("City is required"),
//   check("state").exists({ checkFalsy: true }).withMessage("State is required"),
//   check("country").exists({ checkFalsy: true }).withMessage("Country is required"),
//   check("lat").exists({ checkFalsy: true }).isNumeric().withMessage("Latitude is not valid"),
//   check("lng").exists({ checkFalsy: true }).isNumeric().withMessage("Longitude is not valid"),
//   check("name").exists({ checkFalsy: true }).withMessage("Name must be less than 50 characters"),
//   check("description").exists({ checkFalsy: true }).withMessage("Description is required"),
//   check("price").exists({ checkFalsy: true }).isNumeric().withMessage("Price per day is required"),
//   handleValidationErrors,
// ];

// // router.post("/", requireAuth, async (req, res) => {
// //   try {
// //     const { address, city, state, country, lat, lng, name, description, price } = req.body;

// //     // Validate the request body
// //     if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
// //       return res.status(400).json({ message: "Invalid request body" });
// //     }

// //     if (typeof lat !== "number" || typeof lng !== "number" || typeof price !== "number") {
// //       return res.status(400).json({ message: "Invalid data type" });
// //     }

// //     if (price < 0) {
// //       return res.status(400).json({ message: "Price cannot be negative" });
// //     }

// //     const newSpot = await Spot.create({
// //       ownerId: req.user.id,
// //       address,
// //       city,
// //       state,
// //       country,
// //       lat,
// //       lng,
// //       name,
// //       description,
// //       price,
// //     });

// //     res.status(201).json(newSpot);
// //   } catch (err) {
// //     res.status(500).json({ message: "Error creating spot" });
// //   }
// // });

// //create a spot

// router.post("/", requireAuth, async (req, res) => {
//   try {
//     const { address, city, state, country, lat, lng, name, description, price } = req.body;

//     // Validate the request body to ensure all required fields are present
//     if (!address || !city || !state || !country || lat === undefined || lng === undefined || !name || !description || price === undefined) {
//       return res.status(400).json({ message: "Invalid request body" });
//     }

//     // Validate data types
//     if (typeof lat !== "number" || typeof lng !== "number" || typeof price !== "number") {
//       return res.status(400).json({ message: "Invalid data type for lat, lng, or price" });
//     }

//     // Validate that price is non-negative
//     if (price < 0) {
//       return res.status(400).json({ message: "Price cannot be negative" });
//     }

//     // Create a new spot
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

//     // Return the newly created spot with a status of 201 (Created)
//     return res.status(201).json(newSpot);
//   } catch (err) {
//     console.error(err); // Log the error for debugging
//     return res.status(500).json({ message: "Error creating spot", error: err.message });
//   }
// });

// // GET all Spots
// // Add Query Filters to GET all Spots
// // GET all Spots

// // router.get("/", async (req, res) => {
// //   const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

// //   let errors = {};
// //   if (page < 1) errors.page = "Page must be greater than or equal to 1";
// //   if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
// //   if (minLat && isNaN(minLat)) errors.minLat = "Minimum latitude is invalid";
// //   if (maxLat && isNaN(maxLat)) errors.maxLat = "Maximum latitude is invalid";
// //   if (minLng && isNaN(minLng)) errors.minLng = "Minimum longitude is invalid";
// //   if (maxLng && isNaN(maxLng)) errors.maxLng = "Maximum longitude is invalid";
// //   if (minPrice && (isNaN(minPrice) || minPrice < 0)) errors.minPrice = "Minimum price must be greater than or equal to 0";
// //   if (maxPrice && (isNaN(maxPrice) || maxPrice < 0)) errors.maxPrice = "Maximum price must be greater than or equal to 0";

// //   if (Object.keys(errors).length > 0) {
// //     return res.status(400).json({
// //       message: "Bad request",
// //       errors,
// //     });
// //   }

// //   const limit = parseInt(size);
// //   const offset = limit * (parseInt(page) - 1);

// //   let where = {};

// //   if (minLat) where.lat = { [Op.gte]: parseFloat(minLat) };
// //   if (maxLat) where.lat = { ...where.lat, [Op.lte]: parseFloat(maxLat) };
// //   if (minLng) where.lng = { [Op.gte]: parseFloat(minLng) };
// //   if (maxLng) where.lng = { ...where.lng, [Op.lte]: parseFloat(maxLng) };
// //   if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
// //   if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

// //   try {
// //     const spots = await Spot.findAll({
// //       where,
// //       attributes: [
// //         "id",
// //         "ownerId",
// //         "address",
// //         "city",
// //         "state",
// //         "country",
// //         "lat",
// //         "lng",
// //         "name",
// //         "description",
// //         "price",
// //         "createdAt",
// //         "updatedAt",
// //         [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgRating"],
// //       ],
// //       include: [
// //         {
// //           model: Review,
// //           attributes: [],
// //         },
// //         {
// //           model: SpotImage,
// //           required: false, // Ensure spots without images are included
// //           where: { preview: true },
// //           attributes: ["url"],
// //         },
// //       ],
// //       limit,
// //       offset,
// //       group: ["Spot.id", "SpotImages.id"],
// //       subQuery: false,
// //     });

// //     if (spots.length === 0) {
// //       return res.status(200).json({
// //         Spots: [],
// //         page: parseInt(page),
// //         size: limit,
// //       });
// //     }

// //     const formattedSpots = spots.map((spot) => {
// //       const spotData = spot.toJSON();
// //       spotData.previewImage = spotData.SpotImages && spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
// //       delete spotData.SpotImages;
// //       return spotData;
// //     });

// //     res.status(200).json({
// //       Spots: formattedSpots,
// //       page: parseInt(page),
// //       size: limit,
// //     });
// //   } catch (error) {
// //     console.error(error); // Log the error for debugging
// //     res.status(500).json({
// //       message: "Error fetching spots",
// //       error: error.message, // Return the error message
// //     });
// //   }
// // });

// // router.get("/", async (req, res) => {
// //   const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

// //   let errors = {};

// //   // Parse latitude and longitude as numbers
// //   const parsedMinLat = minLat ? parseFloat(minLat) : undefined;
// //   const parsedMaxLat = maxLat ? parseFloat(maxLat) : undefined;
// //   const parsedMinLng = minLng ? parseFloat(minLng) : undefined;
// //   const parsedMaxLng = maxLng ? parseFloat(maxLng) : undefined;

// //   // Validation
// //   if (page < 1) errors.page = "Page must be greater than or equal to 1";
// //   if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
// //   if (parsedMinLat && isNaN(parsedMinLat)) errors.minLat = "Minimum latitude is invalid";
// //   if (parsedMaxLat && isNaN(parsedMaxLat)) errors.maxLat = "Maximum latitude is invalid";
// //   if (parsedMinLng && isNaN(parsedMinLng)) errors.minLng = "Minimum longitude is invalid";
// //   if (parsedMaxLng && isNaN(parsedMaxLng)) errors.maxLng = "Maximum longitude is invalid";
// //   if (minPrice && (isNaN(minPrice) || minPrice < 0)) errors.minPrice = "Minimum price must be greater than or equal to 0";
// //   if (maxPrice && (isNaN(maxPrice) || maxPrice < 0)) errors.maxPrice = "Maximum price must be greater than or equal to 0";

// //   if (Object.keys(errors).length > 0) {
// //     return res.status(400).json({
// //       message: "Bad request",
// //       errors,
// //     });
// //   }

// //   const limit = parseInt(size);
// //   const offset = limit * (parseInt(page) - 1);

// //   let where = {};

// //   // Use parsed values for latitude and longitude filters
// //   if (parsedMinLat) where.lat = { [Op.gte]: parsedMinLat };
// //   if (parsedMaxLat) where.lat = { ...where.lat, [Op.lte]: parsedMaxLat };
// //   if (parsedMinLng) where.lng = { [Op.gte]: parsedMinLng };
// //   if (parsedMaxLng) where.lng = { ...where.lng, [Op.lte]: parsedMaxLng };
// //   if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
// //   if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

// //   try {
// //     const spots = await Spot.findAll({
// //       where,
// //       attributes: [
// //         "id",
// //         "ownerId",
// //         "address",
// //         "city",
// //         "state",
// //         "country",
// //         "lat",
// //         "lng",
// //         "name",
// //         "description",
// //         "price",
// //         "createdAt",
// //         "updatedAt",
// //         [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgRating"],
// //       ],
// //       include: [
// //         {
// //           model: Review,
// //           attributes: [], // Don't return reviews
// //         },
// //         {
// //           model: SpotImage,
// //           required: false, // Allow spots without preview images
// //           where: { preview: true },
// //           attributes: ["url"],
// //         },
// //       ],
// //       limit,
// //       offset,
// //       group: ["Spot.id"],
// //       subQuery: false,
// //     });

// //     const formattedSpots = spots.map((spot) => {
// //       const spotData = spot.toJSON();
// //       spotData.previewImage = spotData.SpotImages && spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
// //       delete spotData.SpotImages;
// //       return spotData;
// //     });

// //     res.status(200).json({
// //       Spots: formattedSpots,
// //       page: parseInt(page),
// //       size: limit,
// //     });
// //   } catch (error) {
// //     console.error(error); // Log the error for debugging
// //     res.status(500).json({
// //       message: "Error fetching spots",
// //       error: error.message, // Return the error message
// //     });
// //   }
// // });

// router.get("/", requireAuth, async (req, res) => {
//   // console.log("TEST");
//   try {
//     const currentUser = req.user.id; // Assuming req.user.id is available

//     // const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

//     const { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

//     let errors = {};
//     if (page < 1) errors.page = "Page must be greater than or equal to 1";
//     if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
//     if (minLat && isNaN(minLat) /*&& minLat >= -90 && minLat <= 90*/) errors.minLat = "Minimum latitude is invalid";
//     if (maxLat && isNaN(maxLat) /*&& maxLat >= -90 && maxLat <= 90*/) errors.maxLat = "Maximum latitude is invalid";
//     if (minLng && isNaN(minLng) /*&& minLng >= -180 && minLng <= 180*/) errors.minLng = "Minimum longitude is invalid";
//     if (maxLng && isNaN(maxLng) /*&& maxLng >= -180 && maxLng <= 180*/) errors.maxLng = "Maximum longitude is invalid";
//     if (minPrice && (isNaN(minPrice) || minPrice < 0)) errors.minPrice = "Minimum price must be greater than or equal to 0";
//     if (maxPrice && (isNaN(maxPrice) || maxPrice < 0)) errors.maxPrice = "Maximum price must be greater than or equal to 0";

//     // console.log(page);
//     // console.log(size);

//     if (Object.keys(errors).length > 0) {
//       return res.status(400).json({
//         message: "Bad Request",
//         errors,
//       });
//     }

//     //Parse latitude and longitude as numbers
//     const parsedMinLat = minLat ? parseFloat(minLat) : undefined;
//     const parsedMaxLat = maxLat ? parseFloat(maxLat) : undefined;
//     const parsedMinLng = minLng ? parseFloat(minLng) : undefined;
//     const parsedMaxLng = maxLng ? parseFloat(maxLng) : undefined;

//     const limit = parseInt(size) || 20
//     const offset = limit * (parseInt(page) - 1);

//     let where = {};
//     where.ownerId = currentUser;

//     //Use parsed values for latitude and longitude filters
//     if (parsedMinLat) where.lat = { [Op.gte]: parsedMinLat };
//     if (parsedMaxLat) where.lat = { ...where.lat, [Op.lte]: parsedMaxLat };
//     if (parsedMinLng) where.lng = { [Op.gte]: parsedMinLng };
//     if (parsedMaxLng) where.lng = { ...where.lng, [Op.lte]: parsedMaxLng };
//     if (minPrice) where.price = { [Op.gte]: parseFloat(minPrice) };
//     if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

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
//           attributes: [], // No need to select any review attributes
//         },
//         {
//           model: SpotImage,
//           where: {
//             preview: true,
//           },
//           attributes: ["id", "url"], // SpotImage attributes
//           required: false, // Allow spots without preview images
//         },
//       ],
//       limit,
//       offset,
//       group: ["Spot.id", "SpotImages.id"], // Include SpotImages.id in GROUP BY clause
//     });

//     // Format the response
//     const formattedSpots = spots.map((spot) => {
//       const spotData = spot.toJSON();
//       spotData.previewImage = spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
//       delete spotData.SpotImages;
//       return spotData;
//     });

//     res.status(200).json({ Spots: formattedSpots });
//   } catch (err) {
//     console.error(err); // Log the error for debugging
//     res.status(500).json({ message: "Error fetching spots", error: err.message });
//   }
// });

// // Add an Image to Spot with Spot's ID
// router.post("/:spotId/images", requireAuth, async (req, res) => {
//   const { url, preview } = req.body;

//   const spotId = req.params.spotId;

//   try {
//     const spot = await Spot.findByPk(spotId);
//     if (!spot) {
//       return res.status(404).json({ message: "Spot couldn't be found" });
//     }

//     // Ensure req.user is defined
//     if (spot.ownerId !== req.user.id) {
//       return res.status(403).json({ message: "User is not authorized to add an image to this spot" });
//     }
//     // if (spot.ownerId === spotId) {
//     const imageData = await SpotImage.create({ url, preview, spotId });
//     const { createdAt, updatedAt, spotId: removedSpotId, ...imageWithoutTimestamps } = imageData.get({ plain: true });
//     res.status(201).json(imageWithoutTimestamps);
//     //}
//   } catch (err) {
//     console.error(err); // Log the error for debugging
//     res.status(500).json({ message: "An error occurred while uploading the image" });
//   }

//   // try {
//   //   // Find the spot by its primary key (ID)
//   //   const spot = await Spot.findByPk(spotId);
//   //   if (!spot) {
//   //     return res.status(400).json({ message: "Spot can't be found" });
//   //   }

//   //   //Check if the current user owns the spot
//   //   // if (spot.ownerId !== req.user.id) {
//   //   //   return res.status(403).json({ message: "User is not authorized to add an image to this spot" });
//   //   // }
//   //   const imageData = await SpotImage.create({ url, preview, spotId });
//   //   console.log(imageData);
//   //   // Create the image associated with the spot

//   //   // Return the newly created image data
//   //   res.status(201).json(imageData);
//   // } catch (err) {
//   //   console.error(err);
//   //   res.status(500).json({ message: "An error occurred while uploading the image" });
//   // }

//   // if (spot.userId === req.user.id) {
//   //   const newSpotImage = await SpotImage.create({ spotId, url, preview });

//   //   return res.status(201).json(newSpotImage);
//   // }

//   // return res.status(404).json({ message: "Spot couldn't be found" });
// });

// // GET all Spots of current User
// // router.get("/current", requireAuth, async (req, res) => {
// //   try {
// //     const currentUser = req.user.id; // Assuming req.user.id is available

// //     const spots = await Spot.findAll({
// //       where: {
// //         ownerId: currentUser,
// //       },
// //       attributes: [
// //         "id",
// //         "ownerId",
// //         "address",
// //         "city",
// //         "state",
// //         "country",
// //         "lat",
// //         "lng",
// //         "name",
// //         "description",
// //         "price",
// //         "createdAt",
// //         "updatedAt",
// //         [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgRating"],
// //       ],
// //       include: [
// //         {
// //           model: Review,
// //           attributes: [],
// //         },
// //         {
// //           model: SpotImage,
// //           where: {
// //             preview: true,
// //           },
// //           attributes: ["url"],
// //           required: false, // Allow spots without preview images
// //         },
// //       ],
// //       group: ["Spot.id"], // Group only by Spot ID
// //       group: ["Spot.id"],
// //     });

// //     console.log(spots);

// //     const formattedSpots = spots.map((spot) => {
// //       const spotData = spot.toJSON();
// //       spotData.previewImage = spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
// //       delete spotData.SpotImages;
// //       return spotData;
// //     });

// //     res.json({ Spots: formattedSpots });
// //   } catch (err) {
// //     return res.status(500).json({ message: "Error fetching Spots for current User" });
// //   }
// // });

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
//           attributes: [], // Don't return reviews
//         },
//         {
//           model: SpotImage,
//           where: {
//             preview: true, // Only get preview images
//           },
//           attributes: ["url"],
//           required: false, // Allow spots without preview images
//         },
//       ],
//       group: ["Spot.id", "SpotImages.id"], // Group by Spot.id and SpotImages.id to avoid duplicates
//     });

//     const formattedSpots = spots.map((spot) => {
//       const spotData = spot.toJSON();
//       spotData.previewImage = spotData.SpotImages && spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
//       delete spotData.SpotImages;
//       return spotData;
//     });

//     // Return 200 status with the formatted spots in the response
//     return res.status(200).json({
//       Spots: formattedSpots,
//     });
//   } catch (err) {
//     console.error(err); // Log the error for debugging
//     return res.status(500).json({ message: "Error fetching Spots for current User" });
//   }
// });

// // update a Spot
// router.put("/:id", requireAuth, ValidateSpotEdit, async (req, res) => {
//   const spotId = req.params.id;
//   try {
//     const userId = req.user.id;
//     const spot = await Spot.findByPk(spotId);

//     if (!spot) {
//       return res.status(404).json({ message: "Spot couldn't be found" });
//     }

//     if (spot.ownerId !== userId) {
//       return res.status(403).json({ message: "Unauthorized to edit spot" });
//     }

//     const { address, city, state, country, lat, lng, name, description, price } = req.body;

//     //Validate the request body
//     if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
//       return res.status(400).json({ message: "Invalid request body" });
//     }

//     if (typeof lat !== "number" || typeof lng !== "number" || typeof price !== "number") {
//       return res.status(400).json({ message: "Invalid data type" });
//     }

//     if (price < 0) {
//       return res.status(400).json({ message: "Price cannot be negative" });
//     }

//     const updatedSpot = await spot.update({
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

//     const { spotId: noId, ...spotWithoutId } = updatedSpot.get({ plain: true });

//     res.status(200).json(spotWithoutId);
//   } catch (err) {
//     res.status(500).json({ message: "Error updating spot" });
//   }
// });

// // DELETE a Spot
// router.delete("/:id", requireAuth, async (req, res) => {
//   try {
//     const spotId = req.params.id;
//     const userId = req.user.id;
//     const spot = await Spot.findByPk(spotId);

//     if (!spot) {
//       return res.status(404).json({ message: "Spot couldn't be found" });
//     }

//     if (spot.ownerId !== userId) {
//       return res.status(403).json({ message: "Unauthorized to delete spot" });
//     }

//     await spot.destroy();

//     res.status(200).json({ message: "Successfully deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Error deleting spot" });
//   }
// });

// // GET a Spot from an id
// // GET a Spot from an id
// // router.get("/:spotId", async (req, res) => {
// //   try {
// //     const spotId = parseInt(req.params.spotId);
// //     const spot = await Spot.findOne({
// //       where: {
// //         id: spotId,
// //       },
// //       attributes: [
// //         "id",
// //         "ownerId",
// //         "address",
// //         "city",
// //         "state",
// //         "country",
// //         "lat",
// //         "lng",
// //         "name",
// //         "description",
// //         "price",
// //         "createdAt",
// //         "updatedAt",
// //         [Sequelize.fn("COUNT", Sequelize.col("Reviews.id")), "numReviews"],
// //         [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgStarRating"],
// //       ],
// //       include: [
// //         {
// //           model: SpotImage,
// //           attributes: ["id", "url", "preview"],
// //         },
// //         {
// //           model: User,
// //           as: "Owner",
// //           attributes: ["id", "firstName", "lastName"],
// //         },
// //         {
// //           model: Review,
// //           attributes: [],
// //         },
// //       ],
// //       group: ["Spot.id", "SpotImages.id", "Owner.id"],
// //     });

// //     if (!spot) {
// //       return res.status(404).json({ message: "Spot couldn't be found" });
// //     }

// //     res.status(200).json({ Spot: spot });
// //   } catch (error) {
// //     console.error(error); // Log the error for debugging
// //     res.status(500).json({
// //       message: "Error fetching spot from an id",
// //       error: error.message, // Return the error message
// //     });
// //   }
// // });

// // // GET all Spots from a User's id
// // router.get("/spots/:userId", requireAuth, async (req, res) => {
// //   try {
// //     const userId = req.user.id;
// //     const spots = await Spot.findAll({
// //       where: { ownerId: userId },
// //       attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "description", "price", "createdAt", "updatedAt"],
// //       include: [
// //         {
// //           model: Review,
// //           attributes: [],
// //           required: false,
// //         },
// //       ],
// //     });

// //     const spotsWithAvgRating = await Promise.all(
// //       spots.map(async (spot) => {
// //         const avgRating = await Review.average("starRating", {
// //           where: { spotId: spot.id },
// //         });
// //         spot.dataValues.avgRating = avgRating;
// //         return spot;
// //       })
// //     );

// //     res.json(spotsWithAvgRating);
// //   } catch (err) {
// //     res.status(500).json({ message: "Error fetching spots" });
// //   }
// // });

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
//           attributes: [], // Only count and average needed
//         },
//       ],
//       group: ["Spot.id", "SpotImages.id", "Owner.id"],
//     });

//     // If the spot doesn't exist
//     if (!spot) {
//       return res.status(404).json({ message: "Spot couldn't be found" });
//     }

//     // Flattening the response: removing the "Spot" key nesting
//     const spotData = spot.toJSON();
//     res.status(200).json(spotData);
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(500).json({
//       message: "Error fetching spot from an id",
//       error: error.message, // Return the error message
//     });
//   }
// });

// // Get all Reviews by a Spot's id
// router.get("/:spotId/reviews", async (req, res) => {
//   try {
//     const spotId = parseInt(req.params.spotId);

//     const reviews = await Review.findAll({
//       where: {
//         spotId,
//       },
//       include: [
//         {
//           model: User,
//           attributes: ["id", "firstName", "lastName"],
//         },
//         {
//           model: ReviewImage,
//           attributes: ["id", "url"],
//         },
//       ],
//     });

//     if (reviews.length === 0) {
//       return res.status(404).json({ message: "Spot couldn't be found" });
//     }

//     res.json({ Reviews: reviews });
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching all Reviews with Spot's id" });
//   }
// });

// // Create a Review for a Spot based on the Spot's id
// router.post("/:spotId/reviews", requireAuth, async (req, res) => {
//   const { review, stars } = req.body;
//   const spotId = parseInt(req.params.spotId);
//   const errors = {};

//   if (!review) {
//     errors.review = "Review text is required";
//   }

//   if (stars === undefined || stars < 1 || stars > 5) {
//     errors.stars = "Stars must be an integer from 1 to 5";
//   }

//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({
//       message: "Bad request",
//       errors,
//     });
//   }

//   const spot = await Spot.findOne({
//     where: {
//       id: spotId,
//     },
//     attributes: ["id"],
//   });

//   if (!spot) {
//     return res.status(404).json({ message: "Spot couldn't be found" });
//   }

//   const existingReview = await Review.findOne({
//     where: {
//       userId: req.user.id,
//       spotId,
//     },
//   });

//   console.log(req.user);

//   if (existingReview) {
//     return res.status(500).json({ message: "User already has a review for this spot" });
//   }

//   const newReview = await Review.create({
//     userId: req.user.id,
//     spotId,
//     review,
//     stars,
//   });

//   res.status(201).json(newReview);
// });

// // GET all Bookings for a Spot based on the Spot's id
// router.get("/:spotId/bookings", requireAuth, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const spotId = req.params.spotId;

//     const spot = await Spot.findOne({
//       where: {
//         id: spotId,
//       },
//       attributes: ["id", "ownerId"],
//     });

//     if (!spot) {
//       return res.status(404).json({ message: "Spot couldn't be found" });
//     }

//     const bookings = await Booking.findAll({
//       where: {
//         spotId,
//       },
//       include: {
//         model: User,
//         attributes: ["id", "firstName", "lastName"],
//       },
//     });

//     const formattedBookings = bookings.map((booking) => {
//       const bookingData = booking.toJSON();

//       if (userId !== spot.ownerId) {
//         return {
//           spotId: bookingData.spotId,
//           startDate: bookingData.startDate,
//           endDate: bookingData.endDate,
//         };
//       }

//       return bookingData;
//     });

//     res.json({ Bookings: formattedBookings });
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching all Bookings for a Spot based on the Spot's id" });
//   }
// });

// // Create a Booking from a Spot based on the Spot's id
// router.post("/:spotId/bookings", requireAuth, async (req, res) => {
//   const { startDate, endDate } = req.body;
//   const spotId = req.params.spotId;
//   const userId = parseInt(req.user.id);

//   const errors = {};

//   const spot = await Spot.findOne({
//     where: {
//       id: spotId,
//     },
//     attributes: ["id", "ownerId"],
//   });

//   if (!spot) {
//     return res.status(404).json({ message: "Spot couldn't be found" });
//   }

//   if (spot.ownerId === userId) {
//     return res.status(403).json({ message: "You cannot book your own spot" });
//   }

//   const currentDate = new Date();

//   if (new Date(startDate) < currentDate) {
//     errors.startDate = "startDate cannot be in the past";
//   }
//   if (new Date(endDate) <= new Date(startDate)) {
//     errors.endDate = "endDate cannot be on or before startDate";
//   }

//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({
//       message: "Bad Request",
//       errors,
//     });
//   }

//   const conflictingBookings = await Booking.findOne({
//     where: {
//       spotId,
//       [Op.or]: [
//         {
//           startDate: {
//             [Op.between]: [startDate, endDate],
//           },
//         },
//         {
//           endDate: {
//             [Op.between]: [startDate, endDate],
//           },
//         },
//         {
//           [Op.and]: [
//             {
//               startDate: {
//                 [Op.lte]: startDate,
//               },
//             },
//             {
//               endDate: {
//                 [Op.gte]: endDate,
//               },
//             },
//           ],
//         },
//       ],
//     },
//   });

//   if (conflictingBookings) {
//     return res.status(403).json({
//       message: "Sorry, this spot is already booked for the specified dates",
//       errors: {
//         startDate: "Start date conflict with an existing booking",
//         endDate: "End date conflicts with an existing booking",
//       },
//     });
//   }

//   const newBooking = await Booking.create({
//     spotId,
//     userId,
//     startDate,
//     endDate,
//   });

//   res.status(201).json({
//     id: newBooking.id,
//     spotId: newBooking.spotId,
//     userId: newBooking.userId,
//     startDate: newBooking.startDate,
//     endDate: newBooking.endDate,
//     createdAt: newBooking.createdAt,
//     updatedAt: newBooking.updatedAt,
//   });
// });

const router = require("express").Router(); // import server and route handling functionality
const { Spot, Review, ReviewImage, SpotImage, User, Booking, Sequelize } = require("../../db/models"); // import relevant models

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

// restoreUser verifies token on request
// requireAuth directs an (un)authorized request
const { restoreUser, requireAuth } = require("../../utils/auth");

const { Op } = require("sequelize");

const validateQueryParams = [
  check("page").optional().isInt({ min: 1 }).withMessage("Page must be an integer greater than 0"),
  check("size").optional().isInt({ min: 1 }).withMessage("Size must be an integer greater than 0"),
  check("minLat").optional().isFloat({ min: -90, max: 90 }).withMessage("Minimum latitude must be between -90 to 90"),
  check("maxLat")
    .optional()
    .isFloat({ max: 90 })
    .custom((val, { req }) => parseFloat(req.query.minLat ?? -90) < parseFloat(req.query.maxLat))
    .withMessage("Maximum latitude must be between -90 to 90 and greater than minimum latitude if specified"),
  check("minLng").optional().isFloat({ min: -180, max: 180 }).withMessage("Minimum longitude must be between -180 to 180"),
  check("maxLng")
    .optional()
    .isFloat({ max: 180 })
    .withMessage("Maximum longitude must be less than 180")
    .custom((val, { req }) => parseFloat(req.query.minLng ?? -180) < parseFloat(req.query.maxLng))
    .withMessage("Maximum longitude must be greater than minimum longitude"),
  check("minPrice").optional().isFloat({ min: 0 }).withMessage("Minimum price must be greater than or equal to 0"),
  check("maxPrice")
    .optional()
    .isFloat()
    .custom((val, { req }) => (req.query.minPrice ?? 0) < req.query.maxPrice)
    .withMessage("Maximum price must be greater than 0 and greater than minimum price if specified"),
  handleValidationErrors,
];

/**** GET all spots ****/
router.get("/", validateQueryParams, async (req, res, next) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
  page = page ? page : 1;
  size = size ? size : 20;

  const where = {};

  /*** search filters ***/
  if (minLat != undefined || maxLat != undefined) {
    const filter = [];

    // obligatory "sequelize sucks"
    if (minLat != undefined) {
      filter.push({ [Op.gte]: parseFloat(minLat) });
    }

    if (maxLat != undefined) {
      filter.push({ [Op.lte]: parseFloat(maxLat) });
    }

    where.lat = { [Op.and]: filter };
  }

  if (minLng != undefined || maxLng != undefined) {
    const filter = [];

    if (minLng != undefined) {
      filter.push({ [Op.gte]: parseFloat(minLng) });
    }

    if (maxLng != undefined) {
      filter.push({ [Op.lte]: parseFloat(maxLng) });
    }

    where.lng = { [Op.and]: filter };
  }

  if (minPrice != undefined || maxPrice != undefined) {
    const filter = [];

    if (minPrice != undefined) {
      filter.push({ [Op.gte]: parseFloat(minPrice) });
    }

    if (maxPrice != undefined) {
      filter.push({ [Op.lte]: parseFloat(maxPrice) });
    }

    where.price = { [Op.and]: filter };
  }
  /*** end search filters ***/

  try {
    const allSpots = await Spot.findAll({
      offset: (page - 1) * size,
      limit: size,
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
        [Sequelize.fn("AVG", Sequelize.col("Reviews.stars")), "avgRating"], // Calculate average rating
      ],
      include: [
        {
          model: SpotImage, // Include associated images
          attributes: ["url"], // Get image URL
          where: { preview: true },
          required: false,
          duplicating: false,
        },
        {
          model: Review,
          attributes: [],
          required: false,
          duplicating: false,
        },
      ],
      group: ["Spot.id", "SpotImages.id"],
    });

    const allSpotsArray = allSpots.map((spot) => {
      return {
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: parseFloat(spot.lat), // sometimes these two are strings. i don't know why,
        lng: parseFloat(spot.lng), // but we'll parse them as floats to fix it.
        name: spot.name,
        description: spot.description,
        price: parseFloat(spot.price), // probably worth doing it here too.
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating: spot.get("avgRating") ? parseFloat(spot.get("avgRating")).toFixed(1) : null,
        previewImage: spot.SpotImages.length ? spot.SpotImages[0].url : null,
      };
    });

    return res.status(200).json({ page: page, size: size, Spots: allSpotsArray });
  } catch (error) {
    next(error);
  }
});

/**** Validate Create Spot POST body ****/
const validateSpotData = [
  check("address").exists({ checkFalsy: true }).isString().withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).isString().withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).isString().withMessage("State is required"),
  check("country").exists({ checkFalsy: true }).isString().withMessage("Country is required"),
  check("lat").exists({ checkFalsy: true }).isFloat({ min: -90, max: 90 }).withMessage("Latitude must must be between -90 to 90"),
  check("lng").exists({ checkFalsy: true }).isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 to 180"),
  check("name").exists({ checkFalsy: true }).isString().isLength({ max: 50 }).withMessage("Name must be less than 50 characters"),
  check("description").exists({ checkFalsy: true }).isString().withMessage("Description is required"),
  check("price").exists({ checkFalsy: true }).isFloat({ gt: 0 }).withMessage("Price per day must be a positive number"),
  handleValidationErrors,
];

/**** CREATE spot ****/
router.post("/", restoreUser, requireAuth, validateSpotData, async (req, res) => {
  try {
    const { address, city, state, country, lat, lng, name, description, price } = req.body; // missing id, ownerId
    const { user } = req;
    // const userId = user.id;
    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const newSpot = await Spot.create({
      ownerId: user.id,
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

    return res.status(201).json(newSpot);
  } catch (error) {
    // Handle Sequelize validation errors
    // if (error.name === 'SequelizeValidationError') {
    //   return res.status(400).json({
    //     message: "Bad Request",
    //     errors: error.errors.reduce((acc, curr) => {
    //       acc[curr.path] = curr.message;
    //       return acc;
    //     }, {})
    //   });
    // }
    // Pass any other error to the next middleware
    next(error);
  }
});

/**** GET current user's spots ****/
router.get("/current", restoreUser, requireAuth, async (req, res, next) => {
  try {
    const { user } = req;

    // Restore user ensures user is loggedin
    if (user) {
      const userId = user.id;

      // Capture user's spot listings + associated preview images
      const userSpots = await Spot.findAll({
        where: { ownerId: userId },
        include: [
          // Fetch images
          {
            model: SpotImage,
            where: { preview: true }, // Include only where there are pics
            required: false, // without voiding query if no pics
            attributes: ["url"],
          },
          {
            model: Review, // Fetch reviews for forthcoming aggregation
            attributes: [],
          },
        ],
        attributes: [
          // DELETE. not listing any would pull all atts? listing some will pull that exclusive list of atts?
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
        group: ["Spot.id", "SpotImages.id"],
      });

      // Capture spots in array indexes
      const userSpotsArray = userSpots.map((userSpots) => ({
        id: userSpots.id,
        ownerId: userSpots.ownerId,
        address: userSpots.address,
        city: userSpots.city,
        state: userSpots.state,
        country: userSpots.country,
        lat: userSpots.lat,
        lng: userSpots.lng,
        name: userSpots.name,
        description: userSpots.description,
        price: userSpots.price,
        createdAt: userSpots.createdAt,
        updatedAt: userSpots.updatedAt,
        avgRating: parseFloat(userSpots.get("avgRating")).toFixed(1) || null,
        previewImage: userSpots.SpotImages.length ? userSpots.SpotImages[0].url : null,
      }));

      // Encapsulate spots in object
      return res.status(200).json({ Spots: userSpotsArray });
    } else {
      return res.status(401).json({ message: "Authentication required" });
    }
  } catch (error) {
    // Pass query or response error for handdling
    next(error);
  }
});

/**** GET spot details on id ****/
router.get("/:spotId", async (req, res, next) => {
  // get spot id to parse
  const { spotId } = req.params;

  try {
    // Capture spot deatils including associated images and owner details
    const spot = await Spot.findOne({
      where: { id: spotId },
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
      ],
    });

    // Return 404 if spot not found
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    // Create aggregate columns on query
    const aggregateStats = await Review.findOne({
      where: { spotId: spot.id },
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("Review.id")), "numReviews"],
        [Sequelize.fn("AVG", Sequelize.col("stars")), "avgStarRating"],
      ],
    });

    // Spot details derived from Spots, and spot associations
    // with SpotImages, Reviews, and Users.
    const detailedResponse = {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      numReviews: parseInt(aggregateStats.numReviews) || 0, // aggregate
      avgStarRating: parseFloat(aggregateStats.avgStarRating).toFixed(1) || 0, // aggregate
      SpotImages: spot.SpotImages, // array
      Owner: {
        // alias assocation
        id: spot.Owner.id,
        firstName: spot.Owner.firstName,
        lastName: spot.Owner.lastName,
      },
    };

    return res.status(200).json(detailedResponse);
  } catch (error) {
    return next(error);
  }
});

/**** Validate edit spot data ****/
const validateSpotEdit = [
  check("address").exists({ checkFalsy: true }).withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  check("country").exists({ checkFalsy: true }).withMessage("Country is required"),
  check("lat").isFloat({ min: -90, max: 90 }).withMessage("Latitude must must be between -90 to 90"),
  check("lng").isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 to 180"),
  check("name").exists({ checkFalsy: true }).isLength({ max: 50 }).withMessage("Name must be less than 50 characters"),
  check("description").exists({ checkFalsy: true }).withMessage("Description is required"),
  check("price").isFloat({ gt: 0 }).withMessage("Price per day must be a positive number"),
  handleValidationErrors,
];

/**** EDIT a spot on id ****/
router.put("/:spotId", restoreUser, requireAuth, validateSpotEdit, async (req, res, next) => {
  const { user } = req;
  const userId = user.id;

  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const spot = await Spot.findByPk(req.params.spotId);

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  if (userId !== spot.ownerId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  // update or reassign initial values on update if falsy
  spot.address = address || spot.address;
  spot.city = city || spot.city;
  spot.state = state || spot.state;
  spot.country = country || spot.country;
  spot.lat = lat !== undefined ? lat : spot.lat; // left of ternary checks for undefined, if so, leaves value unchanged
  spot.lng = lng !== undefined ? lng : spot.lng; // right of ternary assigns new value if truthy, otherwise reassigns old value
  spot.name = name || spot.name;
  spot.description = description || spot.description;
  spot.price = price !== undefined ? price : spot.price;

  try {
    await spot.save();
  } catch (error) {
    return next(error);
  }

  return res.status(200).json(spot);
});

/**** DELETE a review by its ID ****/
router.delete("/:spotId", restoreUser, requireAuth, async (req, res, next) => {
  const { user } = req;

  if (!user) {
    return res.status(401).json({ message: "You must be signed in to access this resource." });
  }

  const userId = user.id;
  const dropSpot = await Spot.findByPk(req.params.spotId);

  if (!dropSpot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  if (userId !== dropSpot.ownerId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    await dropSpot.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    return next(error);
  }
});

/**** Validate new booking request ****/
const validateBooking = [
  // Check if startDate exists
  check("startDate")
    .exists({ checkFalsy: true })
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date")
    .custom((value) => {
      const startDate = new Date(value);
      if (startDate < new Date()) {
        throw new Error("Start date cannot be in the past");
      }
      return true;
    }),

  // Check if endDate exists and is after startDate
  check("endDate")
    .exists({ checkFalsy: true })
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error("End date must be after the start date");
      }
      return true;
    }),
  handleValidationErrors,
];

/**** CREATE booking on spot id  ****/
router.post("/:spotId/bookings", restoreUser, requireAuth, validateBooking, async (req, res, next) => {
  const { user } = req; // Retrieve full record of current user
  const { spotId } = req.params; // Retrieve unique identifier of spot user wants to book

  // Retrieve requested booking dates and convert to timestamps
  const startTimestamp = new Date(req.body.startDate).getTime();
  const endTimestamp = new Date(req.body.endDate).getTime();

  // Retrieve full record of spot user wants to book
  const spot = await Spot.findByPk(spotId);

  // User can't book if not logged in
  if (!user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  // User can't create booking for spot that does not exists
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  // Spot owner can't book their own spot
  if (user.id === spot.ownerId) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  // Find conflicting bookings
  const bookingConflicts = await Booking.findAll({
    where: {
      // search for bookings where the requested start
      spotId: spotId, // or end date falls withing an existing booking's dates.
      [Op.or]: {
        startDate: { [Op.between]: [startTimestamp, endTimestamp] },
        endDate: { [Op.between]: [startTimestamp, endTimestamp] },
      },
    },
  });

  // If there are errors, return populate object full of relevant errors
  if (bookingConflicts.length) {
    const errors = {};

    // Iterate over each booking conflict
    for (const conflict of bookingConflicts) {
      // Convert conflicting date into time stamps for comparasion
      const conflictStartTimestamp = new Date(conflict.startDate).getTime();
      const conflictEndTimestamp = new Date(conflict.endDate).getTime();

      // Check if requested start date overlaps with conflicting booking
      if (conflictStartTimestamp < startTimestamp && startTimestamp < conflictEndTimestamp) {
        errors.startDate = "Start date conflicts with an existing booking";
      }

      // Check if requested end date overlaps with conflicting booking
      if (conflictStartTimestamp < endTimestamp && endTimestamp < conflictEndTimestamp) {
        errors.endDate = "End date conflicts with an existing booking";
      }
    }

    // User's requested dates can't overlap existing bookings
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors,
    });
  }

  try {
    // Create new booking for the spot
    const newBooking = await spot.createBooking({
      spotId: spotId,
      userId: user.id,
      startDate: new Date(startTimestamp),
      endDate: new Date(endTimestamp),
    });

    // Return newly created booking
    return res.status(201).json(newBooking);
  } catch (error) {
    return next(error);
  }
});

/**** validate spot image ****/
const validateSpotImage = [
  check("url").exists({ checkFalsy: true }).withMessage("Image url is required"),
  check("preview").exists().isBoolean().withMessage("Preview must be a boolean value"),
  handleValidationErrors,
];

/**** ADD image to spot on id ****/
router.post("/:spotId/images", restoreUser, requireAuth, validateSpotImage, async (req, res, next) => {
  const { spotId } = req.params; // spotId to add image at
  const { user } = req; // current user adding image
  const { url, preview } = req.body; // image data to add
  const userId = user.id;

  try {
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    if (spot.ownerId !== userId) {
      return res.status(403).json({
        message: "Forbidden: You are not allowed to add images to this spot",
      });
    }

    const newImage = await SpotImage.create({
      spotId: spot.id,
      url,
      preview,
    });

    return res.status(201).json({
      id: newImage.id,
      url: newImage.url,
      preview: newImage.preview,
    });
  } catch (error) {
    next(error);
  }
});

/**** validate review ****/
const validateReview = [
  // do we need to validate id type fields: id, userId, spotId?
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review is required")
    .isString()
    .withMessage("Review must be a string")
    .isLength({ max: 4000 })
    .withMessage("Review must not exceed the length of a verified user's tweet"),
  check("stars").exists({ checkFalsy: true }).withMessage("Stars rating is required").isInt({ min: 1, max: 5 }).withMessage("Stars must be an integer between 1 and 5"),
  handleValidationErrors,
];

/**** CREATE review on spot id  ****/
router.post("/:spotId/reviews", restoreUser, requireAuth, validateReview, async (req, res, next) => {
  const { spotId } = req.params; // retireve spotId to add review at
  const { review, stars } = req.body; // retrieve info to populate review
  const { user } = req; // current user adding image
  const userId = user.id;

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  const spotReviews = await Review.findAll({
    where: {
      [Op.and]: [{ spotId: spotId }, { userId: userId }],
    },
  });

  if (spotReviews.length) {
    return res.status(403).json({
      message: "User already has a review for this spot",
    });
  }

  try {
    const newReview = await spot.createReview({
      userId,
      review,
      stars,
    });

    return res.status(201).json(newReview);
  } catch (e) {
    return next(e);
  }
});

/**** GET reviews by spot's id ****/
router.get("/:spotId/reviews", async (req, res) => {
  const { spotId } = req.params;
  const spot = await Spot.findByPk(req.params.spotId); // get spot id

  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  const spotReviews = await Review.findAll({
    where: { spotId: spotId }, // thisTable[foreignKey] === otherTable[uniqueId]
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

  return res.status(200).json({ Reviews: spotReviews });
});

/**** GET bookings by spot's id ****/
router.get("/:spotId/bookings", restoreUser, async (req, res) => {
  const { spotId } = req.params;
  const currentUserId = req.user.id;

  const spot = await spot.findByPk(spotId); // get spot id

  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  const spotBookings = await Booking.findAll({
    where: { spotId: spotId }, // Review.[foreignKey] matches Spot.[uniqueId]
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
    ],
  });

  if (spot.ownerId !== currentUserId) {
    // Capture non-owner booking information
    const nonOwnerBookings = spotBookings.map((booking) => ({
      spotId: booking.spotId,
      startDate: booking.startDate,
      endDate: booking.endDate,
    }));
    return res.status(200).json({ Bookings: nonOwnerBookings });
  }

  // Capture booking information
  const ownerBookings = spotBookings.map((booking) => ({
    User: {
      id: booking.User.id,
      firstName: booking.User.firstName,
      lastName: booking.User.lastName,
    },
    id: booking.id,
    spotId: booking.spotId,
    userId: booking.User.id,
    startDate: booking.startDate,
    endDate: booking.endDate,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  }));

  return res.status(200).json({ Bookings: ownerBookings });
});

module.exports = router;
