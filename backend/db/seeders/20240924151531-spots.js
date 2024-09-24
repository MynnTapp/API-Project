"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Spots", [
      {
        name: "Beachside Getaway",
        address: "123 Beach St",
        city: "Santa Monica",
        state: "CA",
        country: "USA",
        lat: 34.0195,
        lng: -118.4912,
        description: "Relaxing beachside spot with stunning ocean views",
        price: 200.0,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Mountain Retreat",
        address: "456 Mountain Dr",
        city: "Asheville",
        state: "NC",
        country: "USA",
        lat: 35.5953,
        lng: -82.5515,
        description: "Cozy mountain retreat with breathtaking views",
        price: 150.0,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Spots", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
