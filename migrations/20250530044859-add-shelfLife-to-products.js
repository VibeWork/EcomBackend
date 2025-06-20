'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('products', 'shelfLife', {
      type: Sequelize.INTEGER,
      allowNull: true, // or false if required
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('products', 'shelfLife');
  },
};
  