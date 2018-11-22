module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Plans', [{
    id: 1,
    name: 'Basic',
    chatEnabled: false,
    historyEnabled: false,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 2,
    name: 'Premium',
    chatEnabled: true,
    historyEnabled: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }], {}),
  down: (queryInterface) => queryInterface.bulkDelete('Plans', null, {}),
};
