'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Drop user_coupons table
    await queryInterface.dropTable('user_coupons');

    // Step 2: Drop coupons table
    await queryInterface.dropTable('coupons');

    // Step 3: Recreate coupons table with couponId as PK
    await queryInterface.createTable('coupons', {
      couponId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      description: Sequelize.STRING,
      discountType: Sequelize.ENUM('flat', 'percentage'),
      discountValue: Sequelize.FLOAT,
      discountMaxLimit: Sequelize.FLOAT,
      expiryDate: Sequelize.DATE,
      minimumOrderValue: Sequelize.INTEGER,
      applicableCategories: Sequelize.ARRAY(Sequelize.STRING),
      status: {
        type: Sequelize.ENUM('active', 'expired', 'inactive'),
        defaultValue: 'active',
      },
      usageLimitPerUser: Sequelize.INTEGER,
      usageLimitGlobal: Sequelize.INTEGER,
      usedCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Step 4: Recreate user_coupons table with FK to couponId
    await queryInterface.createTable('user_coupons', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      couponId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'coupons',
          key: 'couponId',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      isRedeemed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      issuedAt: Sequelize.DATE,
      redeemedAt: Sequelize.DATE,
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('user_coupons');
    await queryInterface.dropTable('coupons');
  },
};
