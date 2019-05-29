const {
  Roles,
  Users,
  Plans,
} = require('../../models');

const getUserByPhone = (phoneNumber) => Users.findOne({
  where: {
    phoneNumber,
  },
  include: [{
    model: Roles,
    as: 'role',
  }, {
    model: Plans,
    as: 'plan',
    attributes: ['id', 'name'],
  }],
});
const getUserById = (userId) => Users.findOne({
  where: {
    id: userId,
  },
  include: [{
    model: Roles,
    as: 'role',
  }, {
    model: Plans,
    as: 'plan',
    attributes: ['id', 'name'],
  }],
});

module.exports = {
  getUserByPhone,
  getUserById,
};
