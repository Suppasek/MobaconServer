const fs = require('fs');
const path = require('path');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const socketio = require('socket.io');
const sequelize = require('sequelize');
const { forEach } = require('p-iteration');

const apiConfig = require('./config/APIConfig');
const constant = require('./config/APIConstant');
const tokenHelper = require('./helpers/tokenHelper');

const secret = fs.readFileSync(path.join(__dirname, './config/secret.key'));

const {
  Roles,
  Operators,
  Users,
  OperatorTokens,
  UserTokens,
  Requests,
  Plans,
  Carriers,
} = require('./models');
const SocketSchema = require('./mongoSchema/socketSchema');
const ChatRoomSchema = require('./mongoSchema/chatRoomSchema');
const ChatMessageSchema = require('./mongoSchema/chatMessageSchema');

const op = sequelize.Op;
apiConfig.secret = secret;

// ClASSES
class CustomError extends Error {
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
    userId: 13,
    operatorId: 1,
    requestId: 11,
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
const storeChat = async (messageId, userId, operatorId, message, senderRoleId) => {
  const storedChat = await ChatMessageSchema.findByIdAndUpdate(messageId, {
    read: {
      user: senderRoleId === constant.ROLE.USER,
      operator: senderRoleId !== constant.ROLE.USER,
    },
    $push: {
      data: {
        message,
        userId,
        operatorId,
        senderRoleId,
      },
    },
  }, {
    new: true,
  });
  return storedChat.data[storedChat.data.length - 1];
};
const removeSocketId = async (socketId) => {
  await SocketSchema.deleteOne({
    socketId,
  });
};
const authorization = async (socket, next) => {
  jwt.verify(socket.handshake.query.token, apiConfig.secret, { ignoreExpiration: true }, async (error, decoded) => {
    try {
      if (error) {
        throw new CustomError('JsonWebTokenError', 'token is invalid');
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
          throw new CustomError('JsonWebTokenError', 'token is invalid');
        } else if (foundToken.banned) {
          throw new CustomError('JsonWebTokenError', 'token has expired');
        } else if (moment.utc(decoded.exp) < moment.utc()) {
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
          throw new CustomError('JsonWebTokenError', 'token is invalid');
        } else if (foundToken.banned) {
          throw new CustomError('JsonWebTokenError', 'token has expired');
        } else if (moment.utc(decoded.exp) < moment.utc()) {
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
const payloadValidator = async (socketCallback, payload, keys, next) => {
  const required = [];
  await forEach(keys, (key) => {
    if (payload[key] === undefined) {
      required.push(key);
    }
  });

  if (required.length === 0) {
    next();
  } else {
    socketCallback({
      ok: false,
      message: `${required} ${required.length > 1 ? 'are' : 'is'} required`,
    });
  }
};
const sendChatToOperator = async (io, requestId, operatorId, userId, chat) => {
  const operatorSocketIds = await SocketSchema.find({
    userId: operatorId,
    $or: [{
      roleId: constant.ROLE.ADMINISTRATOR,
    }, {
      roleId: constant.ROLE.OPERATOR,
    }],
  });
  const user = await Users.findOne({
    attributes: ['id', 'fullName', 'imagePath'],
    where: {
      id: {
        [op.eq]: userId,
      },
    },
  });
  const request = await Requests.findOne({
    where: {
      id: {
        [op.eq]: requestId,
      },
    },
    include: [{
      model: Carriers,
      as: 'carrier',
      attributes: ['id', 'name'],
    }],
  });
  forEach(operatorSocketIds, (targetSocketId) => {
    io.sockets.connected[targetSocketId.socketId].emit('mobile-chat', {
      ok: true,
      data: {
        _id: chat._id,
        message: chat.message,
        user: user.dataValues,
        request: {
          id: requestId,
          carrier: request.dataValues.carrier.dataValues,
        },
        createdAt: chat.createdAt,
      },
    });
  });
};
const sendChatToUser = async (io, requestId, operatorId, userId, chat) => {
  const operatorSocketIds = await SocketSchema.find({
    userId,
    roleId: constant.ROLE.USER,
  });
  const request = await Requests.findOne({
    where: {
      id: {
        [op.eq]: requestId,
      },
    },
    include: [{
      model: Carriers,
      as: 'carrier',
      attributes: ['id', 'name'],
    }],
  });
  const operator = await Operators.findOne({
    where: {
      id: {
        [op.eq]: operatorId,
      },
    },
  });
  forEach(operatorSocketIds, (targetSocketId) => {
    io.sockets.connected[targetSocketId.socketId].emit('web-chat', {
      ok: true,
      data: {
        _id: chat._id,
        message: chat.message,
        sender: {
          role: {
            id: operator.roleId,
          },
        },
        operator: {
          carrier: request.dataValues.carrier.dataValues,
        },
        createdAt: chat.createdAt,
      },
    });
  });
};
const sendMobileSelfChat = async (io, requestId, operatorId, userId, chat, selfSocketId) => {
  const selfSocketIds = await SocketSchema.find({
    socketId: {
      $ne: selfSocketId,
    },
    userId,
  });
  const request = await Requests.findOne({
    where: {
      id: {
        [op.eq]: requestId,
      },
    },
    include: [{
      model: Carriers,
      as: 'carrier',
      attributes: ['id', 'name'],
    }],
  });

  forEach(selfSocketIds, (SSID) => {
    io.sockets.connected[SSID.socketId].emit('mobile-self-chat', {
      ok: true,
      data: {
        _id: chat._id,
        message: chat.message,
        operator: {
          carrier: request.dataValues.carrier.dataValues,
        },
        createdAt: chat.createdAt,
      },
    });
  });
};
const sendWebSelfChat = async (io, requestId, operatorId, userId, chat, selfSocketId) => {
  const selfSocketIds = await SocketSchema.find({
    socketId: {
      $ne: selfSocketId,
    },
    userId: operatorId,
  });

  forEach(selfSocketIds, (SSID) => {
    io.sockets.connected[SSID.socketId].emit('web-self-chat', {
      ok: true,
      data: {
        _id: chat._id,
        message: chat.message,
        createdAt: chat.createdAt,
      },
    });
  });
};
const mobileChat = async (io, socket, payload, socketCallback) => {
  try {
    const foundSocketId = await SocketSchema.findOne({
      socketId: socket.id,
    });

    if (foundSocketId.roleId !== constant.ROLE.USER) throw new CustomError('ChatError', 'forbidden for chat');
    else {
      const lastRequest = await Requests.findOne({
        where: {
          userId: {
            [op.eq]: foundSocketId.userId,
          },
        },
        include: [{
          model: Carriers,
          as: 'carrier',
          attributes: ['id', 'name'],
        }],
        order: [
          ['id', 'DESC'],
        ],
      });

      if (!lastRequest) throw new CustomError('ChatError', 'request does not exist');
      else if (!lastRequest.operatorId) throw new CustomError('ChatError', 'request is not accept');
      else {
        let storedChat;
        const chatroom = await ChatRoomSchema.findOne({
          userId: foundSocketId.userId,
          operatorId: lastRequest.operatorId,
          requestId: lastRequest.id,
        });

        if (!chatroom) throw new CustomError('ChatError', 'chatroom does not exist');
        else if (!chatroom.messageId) {
          const newChatMessage = await ChatMessageSchema.create({});
          await ChatRoomSchema.updateOne({
            userId: foundSocketId.userId,
            operatorId: lastRequest.operatorId,
            requestId: lastRequest.id,
          }, {
            messageId: newChatMessage.id,
          });
          storedChat = await storeChat(newChatMessage.id, foundSocketId.userId, lastRequest.operatorId, payload.text, constant.ROLE.USER);
        } else {
          storedChat = await storeChat(chatroom.messageId, foundSocketId.userId, lastRequest.operatorId, payload.text, constant.ROLE.USER);
        }

        storedChat = {
          _id: storedChat._id,
          message: storedChat.message,
          senderRoleId: storedChat.senderRoleId,
          createdAt: storedChat.createdAt,
          operator: {
            carrier: lastRequest.dataValues.carrier.dataValues,
          },
        };

        socketCallback({
          ok: true,
        });
        sendChatToOperator(io, lastRequest.id, lastRequest.operatorId, foundSocketId.userId, storedChat);
        sendMobileSelfChat(io, lastRequest.id, lastRequest.operatorId, foundSocketId.userId, storedChat, foundSocketId.socketId);
      }
    }
  } catch (err) {
    socketCallback({
      ok: false,
      error: err,
    });
  }
};
const webChat = async (io, socket, payload, socketCallback) => {
  try {
    const foundSocketId = await SocketSchema.findOne({
      socketId: socket.id,
    });
    const request = await Requests.findOne({
      where: {
        id: {
          [op.eq]: payload.requestId,
        },
      },
    });
    const chatroom = await ChatRoomSchema.findOne({
      userId: request.userId,
      operatorId: request.operatorId,
      requestId: request.id,
    });

    if (foundSocketId.roleId === constant.ROLE.USER) throw new CustomError('ChatError', 'forbidden for chat');
    else if (!request) throw new CustomError('ChatError', 'request not found');
    else if (!request.operatorId) throw new CustomError('ChatError', 'request is not accepted');
    else if (request.operatorId !== foundSocketId.userId) throw new CustomError('ChatError', 'forbidden for this request');
    else if (!chatroom.messageId) throw new CustomError('ChatError', 'forbidden for chat, wait user start the chat');
    else {
      const chat = await storeChat(chatroom.messageId, request.userId, request.operatorId, payload.text, foundSocketId.roleId);
      socketCallback({
        ok: true,
      });
      sendChatToUser(io, request.id, request.operatorId, request.userId, chat);
      sendWebSelfChat(io, request.id, request.operatorId, request.userId, chat, foundSocketId.socketId);
    }
  } catch (err) {
    socketCallback({
      ok: false,
      error: err,
    });
  }
};
const getMobileOldChat = async (socket, payload, socketCallback) => {
  try {
    const foundSocketId = await SocketSchema.findOne({
      socketId: socket.id,
    });

    if (foundSocketId.roleId !== constant.ROLE.USER) throw new CustomError('ChatError', 'forbidden for chat');
    else {
      const lastRequest = await Requests.findOne({
        where: {
          userId: {
            [op.eq]: foundSocketId.userId,
          },
        },
        include: [{
          model: Carriers,
          as: 'carrier',
          attributes: ['id', 'name'],
        }],
        order: [
          ['id', 'DESC'],
        ],
      });

      if (!lastRequest) throw new CustomError('ChatError', 'request does not exist');
      else if (!lastRequest.operatorId) throw new CustomError('ChatError', 'request is not accept');
      else {
        const chatroom = await ChatRoomSchema.findOne({
          userId: foundSocketId.userId,
          operatorId: lastRequest.operatorId,
          requestId: lastRequest.id,
        });

        if (!chatroom) throw new CustomError('ChatError', 'chatroom does not exist');
        else if (!chatroom.messageId) {
          socketCallback({
            ok: true,
            data: [],
          });
        } else {
          const result = await ChatMessageSchema.aggregate([{
            $unwind: '$data',
          }, {
            $skip: payload.existChat,
          }, {
            $limit: apiConfig.chat.loadOldChat,
          }, {
            $group: {
              _id: '$_id',
              data: {
                $push: {
                  _id: '$data._id',
                  message: '$data.message',
                  sender: {
                    role: {
                      id: '$data.senderRoleId',
                    },
                  },
                  createdAt: '$data.createdAt',
                  operator: {
                    carrier: lastRequest.dataValues.carrier.dataValues,
                  },
                },
              },
            },
          }, {
            $match: {
              _id: chatroom.messageId,
            },
          }]);

          socketCallback({
            ok: true,
            data: result[0].data,
          });
        }
      }
    }
  } catch (err) {
    socketCallback({
      ok: false,
      error: err,
    });
  }
};
const getWebOldChat = async (socket, payload, socketCallback) => {
  try {
    const foundSocketId = await SocketSchema.findOne({
      socketId: socket.id,
    });

    if (foundSocketId.roleId === constant.ROLE.USER) throw new CustomError('ChatError', 'forbidden for chat');
    else {
      const request = await Requests.findOne({
        where: {
          id: {
            [op.eq]: payload.requestId,
          },
        },
        include: [{
          model: Carriers,
          as: 'carrier',
          attributes: ['id', 'name'],
        }],
      });

      if (!request) throw new CustomError('ChatError', 'request does not exist');
      else if (!request.operatorId) throw new CustomError('ChatError', 'request is not accept');
      else {
        const chatroom = await ChatRoomSchema.findOne({
          userId: request.userId,
          operatorId: request.operatorId,
          requestId: request.id,
        });

        if (!chatroom) throw new CustomError('ChatError', 'chatroom does not exist');
        else if (!chatroom.messageId) throw new CustomError('ChatError', 'forbidden for chat, wait user start the chat');
        else {
          const result = await ChatMessageSchema.aggregate([{
            $unwind: '$data',
          }, {
            $skip: payload.existChat,
          }, {
            $limit: apiConfig.chat.loadOldChat,
          }, {
            $group: {
              _id: '$_id',
              data: {
                $push: {
                  _id: '$data._id',
                  message: '$data.message',
                  sender: {
                    role: {
                      id: '$data.senderRoleId',
                    },
                  },
                  createdAt: '$data.createdAt',
                  operator: {
                    carrier: request.dataValues.carrier.dataValues,
                  },
                },
              },
            },
          }, {
            $match: {
              _id: chatroom.messageId,
            },
          }]);

          socketCallback({
            ok: true,
            data: result[0].data,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    socketCallback({
      ok: false,
      error: err,
    });
  }
};

module.exports = (server) => {
  // clear();
  clearSockets();
  const io = socketio(server);

  io.on('connection', async (socket) => {
    socket.emit('chat', { message: socket.id });
    await authorization(socket, async () => {
      socket
        .on('mobile-chat', (payload, socketCallback) => payloadValidator(socketCallback, payload, ['text'], () => {
          mobileChat(io, socket, payload, socketCallback);
        }))
        .on('mobile-old-chat', (payload, socketCallback) => payloadValidator(socketCallback, payload, ['existChat'], () => {
          getMobileOldChat(socket, payload, socketCallback);
        }))
        .on('web-chat', (payload, socketCallback) => payloadValidator(socketCallback, payload, ['text', 'requestId'], () => {
          webChat(io, socket, payload, socketCallback);
        }))
        .on('web-old-chat', (payload, socketCallback) => payloadValidator(socketCallback, payload, ['existChat', 'requestId'], () => {
          getWebOldChat(socket, payload, socketCallback);
        }))
        .on('disconnect', () => removeSocketId(socket.id));
    });
  });

  return io;
};
