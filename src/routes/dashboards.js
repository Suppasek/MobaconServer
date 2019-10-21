const Router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');

// API ROUTING FOR WEB APPLICATION
Router.get('/web/dashboard/user', dashboardController.getUserForDashboard);
Router.get('/web/dashboard/request', dashboardController.getRequestForDashboard);
Router.get('/web/dashboard/chat', dashboardController.getChatForDashboard);
Router.get('/web/dashboard/goodrate', dashboardController.getGoodRateForDashboard);

module.exports = Router;
