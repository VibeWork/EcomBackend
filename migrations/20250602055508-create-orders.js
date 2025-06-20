'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      orderId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      discountAmount: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      couponCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isPaid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      paymentStatus: {
        type: Sequelize.STRING,
        defaultValue: 'Pending',
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      orderStatus: {
        type: Sequelize.STRING,
        defaultValue: 'Pending',
      },
      deliveryType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      deliveryPartner: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      trackingNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      deliveryAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      scheduledTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      orderNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      userInstructions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    // Add FK constraint
    await queryInterface.addConstraint('orders', {
      fields: ['userId'],
      type: 'foreign key',
      references: {
        table: 'users',
        field: 'userId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('orders');
  }
};
