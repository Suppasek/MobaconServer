const bcrypt = require('bcryptjs');

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Operators', [{
    id: 1,
    roleId: 1,
    fullName: 'Mobacon Administrator',
    email: 'admin@mobacon.com',
    password: bcrypt.hashSync('wiwiwi', bcrypt.genSaltSync(10)),
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    activated: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }, {
    id: 2,
    roleId: 2,
    fullName: 'Operator Mobacon',
    email: 'operator@mobacon.com',
    password: bcrypt.hashSync('wiwiwi', bcrypt.genSaltSync(10)),
    imagePath: '/mobacon/api/image/profile/default/default_profile.png',
    verified: true,
    activated: true,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }], {}),
  down: (queryInterface) => queryInterface.bulkDelete('Operators', null, {}),
};
