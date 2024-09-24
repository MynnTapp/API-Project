"use strict";

const { Review } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await Review.bulkCreate(
      [
        {
          userId: 1,
          spotId: 1,
          review: "This was an awesome spot!",
          stars: 5,
        },
        {
          userId: 1,
          spotId: 2,
          review: "Terrible!",
          stars: 1,
        },
        {
          userId: 1,
          spotId: 3,
          review: "It was alright.",
          stars: 3,
        },
        {
          userId: 2,
          spotId: 1,
          review: "Very unclean.",
          stars: 2,
        },
        {
          userId: 3,
          spotId: 1,
          review: "Nice trip!",
          stars: 4,
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Reviews";
    return queryInterface.bulkDelete(options, {}, {});
  },
};
