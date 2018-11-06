module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert('Roles', [{
    id: 1,
    name: 'Staff',
  }, {
    id: 2,
    name: 'User',
  }], {}),
  down: (queryInterface) => queryInterface.bulkDelete('Roles', null, {}),
};
