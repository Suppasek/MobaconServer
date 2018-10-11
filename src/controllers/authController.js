const staffModel = require('../models/staffModel');
const jwtController = require('./jwtController');

// validate body
// const validateBody(params)

// for web
const webSignup = (req, res) => {
  const createdStaff = staffModel.createStaff(req.body);
  res.status(201).json({
    token: jwtController.getToken(createdStaff.id),
    message: createdStaff,
  });
};
const webLogin = async (req, res) => {
  const isStaff = await staffModel.checkStaffIsExisting(req.body.email, req.body.password);
  if (isStaff) {
    const staff = staffModel.getStaffByEmail(req.body.email);
    res.status(200).send({
      token: jwtController.getToken(staff.id),
    });
  } else {
    res.status(401).send('Unauthorized');
  }
};

// for mobile
const mobileSignup = (req, res) => {
  res.status(201).json(staffModel.getStaffs());
};
const mobileLogin = (req, res) => {
  res.status(200).send('loged in');
};

module.exports = {
  webSignup,
  webLogin,
  mobileSignup,
  mobileLogin,
};
