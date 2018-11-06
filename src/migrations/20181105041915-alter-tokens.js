module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Tokens', 'createdBy', {
    allowNull: false,
    type: Sequelize.INTEGER,
    after: 'expired',
  })
    .then(() => queryInterface.addIndex('Tokens', ['createdBy']))
    .then(() => queryInterface.addIndex('Tokens', ['expired'])),
  down: (queryInterface) => queryInterface.removeColumn('Tokens', 'createdBy')
    .then(() => queryInterface.removeIndex('Tokens', ['expired'])),
};
