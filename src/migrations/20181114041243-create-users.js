module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    roleId: {
      allowNull: false,
      defaultValue: 2,
      references: { model: 'Roles', key: 'id' },
      type: Sequelize.INTEGER,
    },
    planId: {
      allowNull: false,
      references: { model: 'Plans', key: 'id' },
      type: Sequelize.INTEGER,
    },
    fullName: {
      type: Sequelize.STRING(50),
    },
    phoneNumber: {
      unique: true,
      allowNull: false,
      type: Sequelize.STRING(20),
    },
    password: {
      allowNull: false,
      type: Sequelize.STRING(500),
    },
    imagePath: {
      type: Sequelize.STRING(255),
    },
    verified: {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  })
    .then(() => queryInterface.addIndex('Users', { fields: ['roleId'], name: 'users_roleId_id' }))
    .then(() => queryInterface.addIndex('Users', { fields: ['planId'], name: 'users_planId_id' }))
    .then(() => queryInterface.addIndex('Users', { fields: ['verified'], name: 'users_verified_id' })),
  down: (queryInterface) => queryInterface.dropTable('Users'),
};
