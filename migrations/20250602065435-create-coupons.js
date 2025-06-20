'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('coupons', {
       couponId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING,
       unique: true,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      },
      discountType: {
        type: Sequelize.ENUM('flat', 'percentage')
      },
      discountValue: {
        type: Sequelize.FLOAT
      },
      discountMaxLimit: {
        type: Sequelize.FLOAT
      },
      expiryDate: {
        type: Sequelize.DATE
      },
      minimumOrderValue: {
        type: Sequelize.INTEGER
      },
      applicableCategories: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      status: {
        type: Sequelize.ENUM('active', 'expired', 'inactive'),
        defaultValue: 'active'
      },
      usageLimitPerUser: {
        type: Sequelize.INTEGER
      },
      usageLimitGlobal: {
        type: Sequelize.INTEGER
      },
      usedCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('coupons');
  }
};
