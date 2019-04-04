const Router = require('express').Router();
const operatorController = require('../controllers/operatorController');

// API ROUTING FOR WEB APPLICATION
Router.get('/web/operators', operatorController.getOperators);
Router.get('/web/operator/:userId', operatorController.getOperatorById);

module.exports = Router;
