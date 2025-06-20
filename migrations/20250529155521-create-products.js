'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      productCode: {
        type: Sequelize.STRING,
        unique: true,
      },
      productName: {
        type: Sequelize.STRING,
      },
      productImages: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      description: {
        type: Sequelize.TEXT,
      },
      actualPrice: {
        type: Sequelize.FLOAT,
      },
      discount: {
        type: Sequelize.FLOAT,
      },
      finalPrice: {
        type: Sequelize.FLOAT,
      },
      category: {
        type: Sequelize.STRING,
      },
      subCategory: {
        type: Sequelize.STRING,
      },
      returnable: {
        type: Sequelize.BOOLEAN,
      },

       storageInstructions: {
        type: Sequelize.STRING,
      },
      rating: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isTrending: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isNew: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      expiryDate: {
        type: Sequelize.DATE,
      },
      harvestDate: {
        type: Sequelize.DATE,
      },
      maxPurchaseLimit: {
        type: Sequelize.INTEGER,
      },
      deliveryType: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('products');
  },
};
