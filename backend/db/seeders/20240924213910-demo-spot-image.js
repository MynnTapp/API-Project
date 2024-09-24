'use strict';

const { SpotImage } = require('../models');

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
   await SpotImage.bulkCreate(
    [
      {
        id: 1,
        spotId: 1,
        url: Image.png,
        preview: true
      },
      {
        id: 2,
        spotId: 2,
        url: Image.png,
        preview: false
      },
      {
        id: 3,
        spotId: 3,
        url: Image.png,
        preview: false
      },
      {
        id: 4,
        spotId: 4,
        url: Image.png,
        preview: false
      },
      {
        id: 5,
        spotId: 5,
        url: Image.png,
        preview: false
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
    await queryInterface.bulkDelete('SpotImages', {
      id: [1, 2, 3, 4, 5]
    }, options);
  }
};
