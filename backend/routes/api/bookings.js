const express = require("express");
const router = express.Router();
const { Booking, Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require("../../utils/auth");
const { Op } = require("sequelize");

// GET all of the current User's Bookings
router.get('/current', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: {
        userId
      },
      include: [
        {
          model: Spot,
          attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country',
            'lat', 'lng', 'name', 'price'
          ],
          include: [
            {
              model: SpotImage,
              where: {
                preview: true
              },
              attributes: ['url']
            }
          ]
        },
      ]
    });
  
    const formattedBookings = bookings.map(booking => {
      const bookingData = booking.toJSON();
  
      bookingData.Spot.previewImage = bookingData.Spot.SpotImages.length > 0
        ? bookingData.Spot.SpotImages[0].url
        : null;
      
      delete bookingData.Spot.SpotImages;
  
      return bookingData;
    });
  
    res.json({ Booking: formattedBookings });
  } catch (err) {
    res.status(500).json({ message: "Error fetching all Bookings from current User" });
  }
});

// Edit a Booking
router.put("/:bookingId", requireAuth, async (req, res) => {
  const { startDate, endDate } = req.body;
  const bookingId = req.params.bookingId;
  const userId = req.user.id;

  const booking = await Booking.findByPk(bookingId);

  const errors = {};

  if(!booking) {
    return res.status(404).json({ message: "Booking couldn't be found" });
  }

  if(booking.userId !== userId) {
    return res.status(403).json({ message: "Unauthorized to edit this booking" });
  }

  if(new Date(booking.endDate) < new Date()) {
    return res.status(403).json({ message: "Past bookings can't be modified" });
  }

  if(new Date(startDate) < new Date()) {
    errors.startDate = "startDate cannot be in the past";
  }

  if(new Date(endDate) <= new Date(startDate)) {
    errors.endDate = "endDate cannot be on or before startDate";
  }

  if(Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Bad Request",
      errors
    });
  }

  const conflictingBooking = await Booking.findOne({
    where: {
      spotId: booking.spotId,
      startDate: { [Op.lte]: new Date(endDate) },
      endDate: { [Op.gte]: new Date(startDate) },
      id: { [Op.ne]: bookingId }
    }
  });

  if (conflictingBooking) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking",
      },
    });
  }

  try {
    booking.startDate = startDate;
    booking.endDate = endDate;
    await booking.save();

    return res.status(200).json({ 
      id: booking.id,
      spotId: booking.spotId,
      userId: booking.userId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
     });
  } catch (err) {
    return res.status(500).json({ message: "Error editing booking" });
  }
});

// Delete a Booking
router.delete("/:bookingId", requireAuth, async (req, res) => {
  const bookingId = req.params.bookingId;
  const userId = req.user.id;
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    return res.status(404).json({ message: "Booking couldn't be found" });
  }

  if (booking.userId !== userId) {
    return res.status(403).json({ message: "Unauthorized to delete this booking" });
  }

  if (booking.startDate < new Date()) {
    return res.status(403).json({ message: "Bookings that have been started can't be deleted" });
  }

  try {
    await booking.destroy();

    res.json({ message: "Successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting Booking" });
  }
});

module.exports = router;
