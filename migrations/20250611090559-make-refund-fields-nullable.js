'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('orders', 'refundStatus', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('orders', 'refundInitiatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('orders', 'refundStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Pending',
    });

    await queryInterface.changeColumn('orders', 'refundInitiatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },
};
