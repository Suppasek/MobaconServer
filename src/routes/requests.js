const Router = require('express').Router();
const requestController = require('../controllers/requestController');

// API ROUTING FOR WEB APPLICATION
Router.get('/web/requests', requestController.getRequests);
Router.get('/web/request/bills/:userId', requestController.getBillByUserId);
Router.get('/web/request/review/:userId', requestController.getReviewByUserId);
Router.get('/web/requests/accepted', requestController.getAcceptedRequests);
Router.get('/web/request/:requestId', requestController.getRequestById);
Router.patch('/web/request/:requestId/acceptance', requestController.requestAcceptance);
Router.patch('/web/request/:requestId/decline', requestController.requestDecline);
Router.put('/web/request/:requestId/memo', requestController.putRequestMemoById);
Router.post('/web/request/:requestId/review', requestController.createRequestReviewById);


// API ROUTING FOR MOBILE APPLICATION
Router.post('/mobile/request/:carrierId', requestController.createRequest);
Router.get('/mobile/request/review', requestController.getReviewByRequestId);
Router.patch('/mobile/request/review/:requestId/like', requestController.likeReviewByRequestId);
Router.patch('/mobile/request/review/:requestId/dislike', requestController.dislikeReviewByRequestId);

module.exports = Router;
