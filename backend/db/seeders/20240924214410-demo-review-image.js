'use strict';

const { ReviewImage } = require('../models');

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
    await ReviewImage.bulkCreate(
      [
        {
          id: 1,
          reviewId: 1,
          url: Image.png
        },
        {
          id: 2,
          reviewId: 2,
          url: Image.png
        },
        {
          id: 3,
          reviewId: 3,
          url: Image.png
        },
        {
          id: 4,
          reviewId: 4,
          url: Image.png
        },
        {
          id: 5,
          reviewId: 5,
          url: Image.png
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
    await queryInterface.bulkDelete('ReviewImages', {
      id: [1, 2, 3, 4, 5]
    }, options);
  }
};
