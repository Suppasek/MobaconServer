const bcrypt = require('bcryptjs');
// const mysql = require('mysql2');
// const moment = require('moment');

// mock up staffs
const staffs = [{
  id: '1000000',
  fullName: 'Rawipon Tubtimtong',
  carrier: 'AIS',
  email: 'rawipon.t@gmail.com',
  password: '$2a$08$HOYwHp0VYxj0kMB07Pa8QOsDYQgiKP41RVYCMTLZEb5zRCMoMLNWm',
}];

const checkStaffIsExisting = async (email, password) => {
  const matchedStaff = await staffs.find((element) => element.email === email);
  const result = await bcrypt.compare(password, matchedStaff.password);
  return result;
};
const getStaffs = () => staffs;
const getStaffById = (id) => staffs.find((staff) => staff.id === id);
const getStaffByEmail = (email) => staffs.find((staff) => staff.email === email);
const createStaff = (staff) => {
  const tempStaff = staff;
  tempStaff.id = new Date().getTime().toString();
  tempStaff.password = bcrypt.hashSync(staff.password, 10);
  staffs.push(tempStaff);
  const res = JSON.parse(JSON.stringify(staff));
  delete res.password;
  return res;
};

module.exports = {
  checkStaffIsExisting,
  getStaffs,
  getStaffById,
  getStaffByEmail,
  createStaff,
};
