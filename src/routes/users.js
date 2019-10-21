const Router = require('express').Router();
const userController = require('../controllers/userController');

// API ROUTING FOR MOBILE APPLICATION
Router.patch('/mobile/user', userController.editUser);

module.exports = Router;
