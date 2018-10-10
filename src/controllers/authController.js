const userModel = require('../models/staffModel');
const jwtController = require('./jwtController');

const webSignup = (req, res) => {
  const createdUser = userModel.createWebUser(req.body);
  res.status(201).json({
    token: jwtController.getToken(createdUser.id),
    message: createdUser,
  });
};
const webLogin = async (req, res) => {
  const isUser = await userModel.checkWebUserIsExisting(req.body.username, req.body.password);
  if (isUser) {
    const user = userModel.getUserByEmail(req.body.username);
    res.status(200).send({
      token: jwtController.getToken(user.id),
    });
  } else {
    res.status(401).send('Unauthorized');
  }
};
const mobileSignup = (req, res) => {
  res.status(201).json(userModel.getUsers());
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
