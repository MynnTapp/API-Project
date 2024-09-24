"use strict";

const { Spot } = require("../models");

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
    await Spot.bulkCreate(
      [
        {
          ownerId: 1,
          address: "123 Disney Lane",
          city: "San Francisco",
          state: "California",
          country: "United States of America",
          lat: 37.7645358,
          lng: -122.4730327,
          name: "App Academy",
          description: "Place where web developers are created",
          price: 123,
        },
        {
          ownerId: 1,
          address: "456 Pixar Drive",
          city: "Los Angeles",
          state: "California",
          country: "United States of America",
          lat: 86.0283756,
          lng: -118.9472658,
          name: "Code Smyth",
          description: "Some other place",
          price: 456,
        },
        {
          ownerId: 2,
          address: "1800 Drury Lane",
          city: "Chicago",
          state: "Illinois",
          country: "United States of America",
          lat: 55.8765123,
          lng: -100.9994445,
          name: "The Bean",
          description: "Shiny big bean",
          price: 7373,
        },
        {
          ownerId: 3,
          address: "999 First Street",
          city: "New York",
          state: "New York",
          country: "United States of America",
          lat: 12.3456789,
          lng: -123.456789,
          name: "Big Apple",
          description: "Big city with lots of stuff",
          price: 999,
        },
        {
          ownerId: 2,
          address: "555 Party Ave",
          city: "Orlando",
          state: "Florida",
          country: "United States of America",
          lat: 88.7654321,
          lng: -87.1749827,
          name: "Spring Break",
          description: "Hot sandy beaches",
          price: 555,
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
     *
     */
    options.tableName = "Spots";
    return queryInterface.bulkDelete(options, {}, {});
  },
};
