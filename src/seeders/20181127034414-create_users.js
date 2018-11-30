module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Users', [{
    id: 1,
    roleId: 3,
    planId: 2,
    fullName: 'Uzumaki Naruto',
    phoneNumber: '0846915660',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }]),
  down: (queryInterface) => queryInterface.bulkDelete('Users', null, {}),
};
