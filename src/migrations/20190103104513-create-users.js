module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Users', 'family', {
    after: 'imagePath',
    defaultValue: null,
    type: Sequelize.INTEGER,
  }),
  down: (queryInterface) => queryInterface.removeColumn('Users', 'family'),
};
