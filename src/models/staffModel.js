const bcrypt = require('bcryptjs');
// const moment = require('moment');

// mock up staffs
const staffs = [{
  id: '1000000',
  fullName: 'Rawipon Tubtimtong',
  carrier: 'AIS',
  email: 'rawipon.t@gmail.com',
  password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
}];

const checkWebUserIsExisting = async (username, password) => {
  const matchedUser = await staffs.find(async (element) => element.email === username);
  const result = await bcrypt.compare(password, matchedUser.password);
  return result;
};
const getUsers = () => staffs;
const getUserById = (id) => staffs.find((user) => user.id === id);
const getUserByEmail = (email) => staffs.find((user) => user.email === email);
const createWebUser = (staff) => {
  const tempStaff = staff;
  tempStaff.id = new Date().getTime().toString();
  tempStaff.password = bcrypt.hashSync(staff.password, 8);
  staffs.push(tempStaff);
  const res = JSON.parse(JSON.stringify(staff));
  delete res.password;
  return res;
};

module.exports = {
  checkWebUserIsExisting,
  getUsers,
  getUserById,
  getUserByEmail,
  createWebUser,
};
