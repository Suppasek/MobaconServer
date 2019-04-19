const { Client, Notification } = require('onesignal-node');
const oneSignalConfig = require('../../config/OneSignalConfig');

const client = new Client(oneSignalConfig);

const sendNotification = (data, userTokens) => {
  if (userTokens.length !== 0) {
    const notification = new Notification({
      contents: {
        en: data.title,
      },
      data,
      include_player_ids: userTokens,
    });
    client.sendNotification(notification);
  }
};

module.exports = {
  sendNotification,
};
