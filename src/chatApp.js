const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const sequelize = require('sequelize');
const moment = require('moment-timezone');
const { forEach } = require('p-iteration');

const apiConfig = require('./config/APIConfig');
const constant = require('./config/APIConstant');
const mongoConfig = require('./config/MongoConfig');
const tokenHelper = require('./helpers/tokenHelper');
const {
  Roles,
  Operators,
  Users,
  OperatorTokens,
  UserTokens,
  Plans,
} = require('./models');
const SocketSchema = require('./mongoSchema/socketSchema');
const ChatRoomSchema = require('./mongoSchema/chatRoomSchema');
const ChatMessageSchema = require('./mongoSchema/chatMessageSchema');

const op = sequelize.Op;

mongoose.connect(mongoConfig.mongoUri, {
  useNewUrlParser: true,
});

// ClASSES
class JwtError extends Error {
  constructor(name, message) {
    super();
    this.name = name;
    this.message = message;
  }
}

// METHODS
const clear = async () => {
  await ChatRoomSchema.deleteMany({});
  await ChatRoomSchema.create({
    userId: 1,
    operatorId: 1,
    requestId: 12,
  });
  await ChatMessageSchema.deleteMany({});
};
const clearSockets = async () => {
  await SocketSchema.deleteMany({});
};
const storeSocketId = async (socketId, user) => {
  await SocketSchema.create({
    userId: user.id,
    roleId: user.role.id,
    socketId,
  });
};
const storeChat = async (messageId, userId, operatorId, message) => {
  await ChatMessageSchema.findByIdAndUpdate(messageId, {
    $push: {
      data: {
        message,
        userId,
        operatorId,
      },
    },
  });
};
const removeSocketId = async (socketId) => {
  await SocketSchema.deleteOne({
    socketId,
  });
};
const authorization = (socket, next) => {
  jwt.verify(socket.handshake.query.token, apiConfig.secret, { ignoreExpiration: true }, async (error, decoded) => {
    try {
      if (error) {
        throw new JwtError('JsonWebTokenError', 'token is invalid');
      } else if (decoded.data.role.id === constant.ROLE.USER) {
        const user = await Users.findOne({
          attributes: ['id', 'fullName', 'phoneNumber', 'imagePath'],
          where: {
            id: {
              [op.eq]: decoded.data.id,
            },
          },
          include: [{
            model: Roles,
            as: 'role',
            attributes: ['id', 'name'],
          }, {
            model: Plans,
            as: 'plan',
            attributes: ['id', 'name'],
          }],
        });

        const foundToken = await UserTokens.findOne({
          where: {
            token: {
              [op.eq]: socket.handshake.query.token,
            },
          },
        });

        if (!foundToken) {
          throw new JwtError('JsonWebTokenError', 'token is invalid');
        } else if (foundToken.banned) {
          throw new JwtError('JsonWebTokenError', 'token has expired');
        } else if (moment(decoded.exp).tz(apiConfig.timezone) < moment().tz(apiConfig.timezone)) {
          const newToken = await tokenHelper.getUserToken(user);
          foundToken.update({
            banned: true,
          });
          socket.emit('authorized', {
            ok: true,
            token: newToken,
          });
          storeSocketId(socket.id, user);
          next();
        } else {
          socket.emit('authorized', {
            ok: true,
          });
          storeSocketId(socket.id, user);
          next();
        }
      } else {
        const operator = await Operators.findOne({
          attributes: ['id', 'fullName', 'phoneNumber', 'email', 'imagePath'],
          where: {
            id: {
              [op.eq]: decoded.data.id,
            },
          },
          include: [{
            model: Roles,
            as: 'role',
            attributes: ['id', 'name'],
          }],
        });

        const foundToken = await OperatorTokens.findOne({
          where: {
            token: {
              [op.eq]: socket.handshake.query.token,
            },
          },
        });

        if (!foundToken) {
          throw new JwtError('JsonWebTokenError', 'token is invalid');
        } else if (foundToken.banned) {
          throw new JwtError('JsonWebTokenError', 'token has expired');
        } else if (moment(decoded.exp).tz(apiConfig.timezone) < moment().tz(apiConfig.timezone)) {
          const newToken = await tokenHelper.getOperatorToken(operator);
          foundToken.update({
            banned: true,
          });
          socket.emit('authorized', {
            ok: true,
            token: newToken,
          });
          storeSocketId(socket.id, operator);
          next();
        } else {
          socket.emit('authorized', {
            ok: true,
          });
          storeSocketId(socket.id, operator);
          next();
        }
      }
    } catch (err) {
      socket.emit('authorized', {
        ok: false,
        error: err,
      });
      socket.disconnect();
    }
  });
};
const payloadValidator = (payload, keys, next) => {
  const required = [];
  forEach(keys, (key) => {
    if (payload[key] === undefined) {
      required.push(key);
    }
  });

  if (required.length === 0) {
    next();
  }
};
const sendChat = (io, targetSocketIds, senderId, message) => {
  forEach(targetSocketIds, (targetSocketId) => {
    io.sockets.connected[targetSocketId.socketId].emit('chat', {
      ok: true,
      senderId,
      message,
    });
  });
};
const checkAndChat = async (io, socketId, payload, next) => {
  try {
    const socketOwner = await SocketSchema.findOne({
      socketId,
    });

    if (socketOwner.roleId === constant.ROLE.USER) {
      const user = await Users.findOne({
        where: {
          id: {
            [op.eq]: socketOwner.userId,
          },
        },
      });
      const targetSocketIds = await SocketSchema.find({
        userId: payload.targetId,
        $or: [{
          roleId: constant.ROLE.ADMINISTRATOR,
        }, {
          roleId: constant.ROLE.OPERATOR,
        }],
      }).select('socketId');

      const chatRoom = await ChatRoomSchema.findOne({
        userId: socketOwner.userId,
        operatorId: payload.targetId,
      });

      if (!user) throw new Error();
      else if (user.planId === constant.PLAN.BASIC) throw new Error();
      else if (!chatRoom) throw new Error();
      else if (!chatRoom.messageId) throw new Error();

      await storeChat(chatRoom.messageId, socketOwner.userId, payload.targetId, payload.message);
      await sendChat(io, targetSocketIds, socketOwner.userId, payload.message);
      next({ ok: true });
    } else {
      const operator = await Operators.findOne({
        where: {
          id: {
            [op.eq]: socketOwner.userId,
          },
        },
      });
      const targetSocketIds = await SocketSchema.find({
        userId: payload.targetId,
        roleId: constant.ROLE.USER,
      }).select('socketId');

      const chatRoom = await ChatRoomSchema.findOne({
        userId: payload.targetId,
        operatorId: socketOwner.userId,
      });

      if (!operator) throw new Error();
      else if (!chatRoom) throw new Error();
      else if (!chatRoom.messageId) {
        const newChatMessages = await ChatMessageSchema.create({});
        await ChatRoomSchema.findByIdAndUpdate(chatRoom.id, {
          messageId: newChatMessages.id,
        });
        await storeChat(newChatMessages.id, payload.targetId, socketOwner.userId, payload.message);
      } else {
        await storeChat(chatRoom.messageId, payload.targetId, socketOwner.userId, payload.message);
      }

      sendChat(io, targetSocketIds, socketOwner.userId, payload.message);
      next({ ok: true });
    }
  } catch (err) {
    next({
      ok: false,
      message: 'forbidden for chat',
    });
  }
};

module.exports = (server) => {
  clear();
  clearSockets();
  const io = socketio(server);

  io.on('connection', async (socket) => {
    socket.emit('chat', { message: socket.id });
    authorization(socket, () => {
      socket
        .on('chat', (payload, next) => payloadValidator(payload, ['message', 'targetId'], () => checkAndChat(io, socket.id, payload, next)))
        .on('disconnect', () => removeSocketId(socket.id));
    });
  });
};