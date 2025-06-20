'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'paidAmount', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0, // Or better: update existing rows manually after migration
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('orders', 'paidAmount');
  }
};
