module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Roles', [{
    id: 1,
    name: 'Administrator',
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 2,
    name: 'Operator',
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 3,
    name: 'User',
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }], {}),
  down: (queryInterface) => queryInterface.bulkDelete('Roles', null, {}),
};
