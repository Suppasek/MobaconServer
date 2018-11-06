module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Staffs', [{
    id: 1,
    roleId: 1,
    fullName: 'Rawipon Tubtimtong',
    carrier: 'AIS',
    email: 'rawipon.t@gmail.com',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    verified: '1',
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }], {}),
  down: (queryInterface) => queryInterface.bulkDelete('Staffs', null, {}),
};
