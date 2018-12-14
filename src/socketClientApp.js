const io = require('socket.io-client');

module.exports = (analyticUrl) => {
  const socket = io(analyticUrl);

  socket.on('connect', () => {
    console.log('connect with analytic side successfully');
  });
  socket.on('connect_error', () => {
    console.log('connect with analytic side failed');
  });
  socket.on('billing.new', (payload) => {
    // create a new request
    // create chatroom
  });
};
