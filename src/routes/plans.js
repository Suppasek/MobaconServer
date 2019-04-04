const Router = require('express').Router();
const planController = require('../controllers/planController');

// API ROUTING FOR WEB APPLICATION
Router.get('/web/plans', planController.getPlans);
Router.patch('/web/plan/basic', planController.updatePlan);

// API ROUTING FOR MOBILE APPLICATION
Router.patch('/mobile/user/family', planController.updateFamily);

module.exports = Router;
