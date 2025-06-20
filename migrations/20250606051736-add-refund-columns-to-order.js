// migrations/{timestamp}-add-refund-columns-to-order.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'refundInitiatedAt', {
      type: Sequelize.DATE,
      allowNull: true, // Allow null initially (since this field will be set later)
    });

    await queryInterface.addColumn('orders', 'refundStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Pending', // Default to 'Pending' status
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('orders', 'refundInitiatedAt');
    await queryInterface.removeColumn('orders', 'refundStatus');
  },
};
