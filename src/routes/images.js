const Router = require('express').Router();
const imageController = require('../controllers/imageController');

Router.get('/image/profile/default/:imageName', imageController.getDefaultProfileImage);
Router.get('/web/operator/image/:imageName', imageController.getOperatorImage);
Router.get('/web/user/image/:imageName', imageController.getUserImage);

module.exports = Router;
