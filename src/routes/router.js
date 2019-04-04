const Router = require('express').Router();
const moment = require('moment');
const config = require('../config/APIConfig');
const notificationService = require('../controllers/services/socketService');

const { requestController } = require('../controllers');

// API ROUTING FOR VALIDATE IN APP PURCHASE
Router.patch('/mobile/iap/apple');
Router.patch('/mobile/iap/google');

// TEST  NOTIFICATION
Router.get('/test/notification/acceptance/:userId', async (req, res) => {
  try {
    await notificationService.sendNotification(
      {
        type: config.notification.acceptance.type,
        title: config.notification.acceptance.title,
        body: config.notification.acceptance.body,
      },
      req.params.userId,
    );
    res.send('success');
  } catch (err) {
    res.send(err);
  }
});
Router.get('/test/notification/review/:userId', async (req, res) => {
  try {
    await notificationService.sendNotification(
      {
        type: config.notification.review.type,
        title: config.notification.review.title,
        body: config.notification.review.body,
        data: {
          id: 111,
          review: 'test review for notification mock up',
          suggestion: 'test suggestion for notification mock up',
          createdAt: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
        },
      },
      req.params.userId,
    );
    res.send('success');
  } catch (err) {
    res.send(err);
  }
});
Router.post('/test/xml/:carrierId', async (req, res) => {
  const user = {
    id: '1234',
  };
  const createdBill = await requestController.createNewBill(
    user.id,
    req.params.carrierId,
    req.rawBody,
  );
  res.json(createdBill);
});

Router.use(require('./authentications'));
Router.use(require('./chats'));
Router.use(require('./dashboards'));
Router.use(require('./images'));
Router.use(require('./operators'));
Router.use(require('./plans'));
Router.use(require('./reportHistories'));
Router.use(require('./requests'));
Router.use(require('./users'));

module.exports = Router;
