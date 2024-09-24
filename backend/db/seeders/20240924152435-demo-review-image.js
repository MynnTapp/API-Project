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
    await ReviewImage.bulkCreate([
      {
        reviewId: 1,
        url: Image.png,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: 2,
        url: Image.png,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: 3,
        url: Image.png,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: 4,
        url: Image.png,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: 5,
        url: Image.png,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'ReviewImages';

    return queryInterface.bulkDelete(options, null, {});
  }
};
