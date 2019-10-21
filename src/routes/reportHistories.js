const Router = require('express').Router();
const reportHistoryController = require('../controllers/reportHistoryController');

// API ROUTING FOR MOBILE APPLICATION
Router.get('/mobile/report/history', reportHistoryController.getReportHistory);

module.exports = Router;
