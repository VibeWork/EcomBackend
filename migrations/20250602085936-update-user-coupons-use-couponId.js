'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Only add foreign key constraint if it doesn't already exist
    await queryInterface.addConstraint('user_coupons', {
      fields: ['couponId'],
      type: 'foreign key',
      name: 'fk_user_coupons_couponId', // Unique name for the constraint
      references: {
        table: 'coupons',
        field: 'couponId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove constraint on down
    await queryInterface.removeConstraint('user_coupons', 'fk_user_coupons_couponId');
  }
};
