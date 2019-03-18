module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Operators', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    roleId: {
      allowNull: false,
      defaultValue: 1,
      references: { model: 'Roles', key: 'id' },
      type: Sequelize.INTEGER,
    },
    fullName: {
      type: Sequelize.STRING(50),
    },
    phoneNumber: {
      type: Sequelize.STRING(20),
    },
    email: {
      unique: true,
      allowNull: false,
      type: Sequelize.STRING(50),
    },
    password: {
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
    activated: {
      allowNull: false,
      defaultValue: true,
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
    .then(() => queryInterface.addIndex('Operators', { fields: ['roleId'], name: 'operators_roleId_idx' }))
    .then(() => queryInterface.addIndex('Operators', { fields: ['verified'], name: 'operators_verified_idx' }))
    .then(() => queryInterface.addIndex('Operators', { fields: ['activated'], name: 'operators_activated_idx' })),
  down: (queryInterface) => queryInterface.dropTable('Operators'),
};
