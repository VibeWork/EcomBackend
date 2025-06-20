'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ✅ Remove old 'address' column
    await queryInterface.removeColumn('users', 'address');
    
    // ⚠️ No need to add 'addresses' column; relationship is handled in the model using association
  },

  down: async (queryInterface, Sequelize) => {
    // 🔁 Revert: Add back 'address' column if rollback needed
    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
