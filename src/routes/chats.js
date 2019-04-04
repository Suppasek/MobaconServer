const Router = require('express').Router();
const chatController = require('../controllers/chatController');

// API ROUTING FOR WEB APPLICATION
Router.get('/web/request/chat/:userId', chatController.getChatHistoryByUserId);
Router.get('/web/request/chat/detail/:requestId/:existChat', chatController.getOldChatByRequestId);

module.exports = Router;
