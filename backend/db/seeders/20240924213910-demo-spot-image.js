"use strict";

const { SpotImage } = require("../models");

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
    await SpotImage.bulkCreate(
      [
        {
          spotId: 1,
          url: "Image.png",
          preview: true,
        },
        {
          spotId: 2,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 3,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 4,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 5,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 2,
          url: "Image.png",
          preview: true,
        },
        {
          spotId: 3,
          url: "Image.png",
          preview: true,
        },
        {
          spotId: 4,
          url: "Image.png",
          preview: true,
        },
        {
          spotId: 5,
          url: "Image.png",
          preview: true,
        },
        {
          spotId: 2,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 3,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 4,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 5,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 4,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 5,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 4,
          url: "Image.png",
          preview: false,
        },
        {
          spotId: 1,
          url: "Image.png",
          preview: false,
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
    options.tableName = "SpotImages";
    return queryInterface.bulkDelete(options, {}, {});
  },
};
