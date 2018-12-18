const nameRandom = require('random-name');
const numberRandom = require('random-number').generator({
  min: 1,
  max: 2,
  integer: true,
});

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Users', [{
    id: 1,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000001',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 2,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000002',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 3,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000003',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 4,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000004',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 5,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000005',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 6,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000006',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 7,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000007',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 8,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000008',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 9,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000009',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 10,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000010',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 11,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000011',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 12,
    roleId: 3,
    planId: numberRandom(),
    fullName: nameRandom(),
    phoneNumber: '0800000012',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 13,
    roleId: 3,
    planId: 1,
    fullName: 'Mobacon M. Test',
    phoneNumber: '0800000013',
    password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }]),
  down: (queryInterface) => queryInterface.bulkDelete('Users', null, {}),
};
