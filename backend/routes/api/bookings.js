const express = require("express");
const router = express.Router();
const { Booking, Spot, SpotImage } = require('../../db/models');
const { requireAuth } = require("../../utils/auth");

// GET all of the current User's Bookings
router.get('/current/', requireAuth, async (req, res) => {
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

router.get("/:spotsid", requireAuth, async (req, res) => {
  const spotId = req.params.spotsid;
  const userId = req.user.id;
  const spot = await spots.findBySpotId(spotId);

  if (!spot) {
    return res.status(404).json({ message: "Spot not found" });
  }
  const bookings = await bookings.findBySpotId(spotId);

  if (spot.userId === userId) {
    const detailedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const user = await users.findByUserId(booking.userId);
        return {
          id: booking.id,
          spotId: booking.spotId,
          userId: booking.userId,
          startDate: booking.startDate,
          endDate: booking.endDate,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        };
      })
    );
    res.json(detailedBookings);
  } else {
    const limitedBookings = bookings.map((booking) => ({
      spotId: booking.spotId,
      startDate: booking.startDate,
      endDate: booking.endDate,
    }));
    res.json(limitedBookings);
  }
});

router.post("/:spotsid", requireAuth, async (req, res) => {
  const spotId = req.params.spotsid;
  const userId = req.user.id;
  const spot = await spots.findBySpotId(spotId);

  if (!spot) {
    return res.status(404).json({ message: "Spot not found" });
  }

  if (spot.userId === userId) {
    return res.status(403).json({ message: "Unauthorized to create a booking for your own spot" });
  }

  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  const existingBooking = await bookings.findBySpotIdAndDates(spotId, startDate, endDate);
  if (existingBooking) {
    return res.status(403).json({ message: "Booking already exists for this spot on these dates" });
  }

  try {
    const newBooking = await bookings.createBooking(spotId, userId, startDate, endDate);
    res.json(newBooking);
  } catch (err) {
    res.status(500).json({ message: "Error creating booking" });
  }
});

router.delete("/:bookingsid", requireAuth, async (req, res) => {
  const bookingId = req.params.bookingsid;
  const userId = req.user.id; // get the authenticated user's ID
  const booking = await bookings.findByBookingId(bookingId);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.userId !== userId && booking.spot.userId !== userId) {
    return res.status(403).json({ message: "Unauthorized to delete this booking" });
  }

  if (booking.startDate < new Date()) {
    return res.status(400).json({ message: "Cannot delete current or past bookings" });
  }

  try {
    await bookings.deleteBooking(bookingId);
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting booking" });
  }
});

router.put("/:bookingsid", requireAuth, async (req, res) => {
  const bookingId = req.params.bookingsid;
  const userId = req.user.id;
  const booking = await bookings.findByBookingId(bookingId);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.userId !== userId) {
    return res.status(403).json({ message: "Unauthorized to edit this booking" });
  }

  if (booking.endDate < new Date()) {
    return res.status(400).json({ message: "Cannot edit past bookings" });
  }

  const spotId = req.body.spotId;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  const existingBooking = await bookings.findBySpotIdAndDates(spotId, startDate, endDate);
  if (existingBooking) {
    return res.status(403).json({ message: "Booking already exists for this spot on these dates" });
  }

  try {
    const updatedBooking = await bookings.updateBooking(bookingId, req.body);
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: "Error updating booking" });
  }
});
module.exports = router;
