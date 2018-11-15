module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Staffs', {
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
    .then(() => queryInterface.addIndex('Staffs', { fields: ['roleId'], name: 'staffs_roleId_idx' }))
    .then(() => queryInterface.addIndex('Staffs', { fields: ['verified'], name: 'staffs_verified_idx' }))
    .then(() => queryInterface.addIndex('Staffs', { fields: ['activated'], name: 'staffs_activated_idx' })),
  down: (queryInterface) => queryInterface.dropTable('Staffs'),
};
