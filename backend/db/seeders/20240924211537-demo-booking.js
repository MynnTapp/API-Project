'use strict';

const { Booking } = require('../models');

let options = {};
if(process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await Booking.bulkCreate(
      [
        {
          id: 1,
          spotId: 1,
          userId: 1,
          startDate: '2021-11-19',
          endDate: '2021-11-20'
        },
        {
          id: 2,
          spotId: 2,
          userId: 2,
          startDate: '2022-11-19',
          endDate: '2022-11-20'
        },
        {
          id: 3,
          spotId: 3,
          userId: 3,
          startDate: '2023-11-19',
          endDate: '2023-11-20'
        },
        {
          id: 4,
          spotId: 1,
          userId: 3,
          startDate: '2024-11-19',
          endDate: '2024-11-20'
        },
        {
          id: 5,
          spotId: 2,
          userId: 1,
          startDate: '2021-12-19',
          endDate: '2021-12-20'
        }
      ],
      { validate: true }
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Bookings', {
      id: [1, 2, 3, 4, 5]
    }, options);
  }
};
