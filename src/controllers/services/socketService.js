const fs = require('fs');
const path = require('path');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const socketio = require('socket.io');
const sequelize = require('sequelize');
const { forEach } = require('p-iteration');

const CustomError = require('./CustomError');
const apiConfig = require('../../config/APIConfig');
const constant = require('../../config/APIConstant');
const tokenHelper = require('../../helpers/tokenHelper');
const {
  Roles,
  Operators,
  Users,
  OperatorTokens,
  UserTokens,
  Requests,
  Plans,
  Carriers,
} = require('../../models');
const SocketSchema = require('../../mongoSchema/socketSchema');
const ChatRoomSchema = require('../../mongoSchema/chatRoomSchema');
const ChatMessageSchema = require('../../mongoSchema/chatMessageSchema');

const secret = fs.readFileSync(path.join(__dirname, '../../config/secret.key'));

const op = sequelize.Op;
apiConfig.secret = secret;

let IO;

// FOR MOCKUP
const generateChatHistory = (userId, operatorId, operatorRoleId) => [{
  message: 'hi there !',
  userId,
  operatorId,
  senderRoleId: 3,
  createdAt: '2018-12-08 00:00:01',
}, {
  message: 'hi, how can I help you ?',
  userId,
  operatorId,
  senderRoleId: operatorRoleId,
  createdAt: '2018-12-08 00:00:03',
}];
const generateChatRoom = (userId, operatorId, requestId, messageId) => ({
  userId,
  operatorId,
  requestId,
  messageId,
  createdAt: '2018-12-05 10:00:00',
  updatedAt: '2018-12-08 00:00:03',
});

// METHODS FOR CHAT
const clear = async () => {
  await ChatRoomSchema.deleteMany({});
  await ChatMessageSchema.deleteMany({});

  const chatMessage = await ChatMessageSchema.insertMany([{
    data: generateChatHistory(1, 1, 1),
  }, {
    data: generateChatHistory(2, 1, 1),
  }, {
    data: generateChatHistory(3, 1, 1),
  }, {
    data: generateChatHistory(4, 2, 2),
  }, {
    data: generateChatHistory(5, 2, 2),
  }, {
    data: generateChatHistory(6, 2, 2),
  }]);

  await ChatRoomSchema.create([
    generateChatRoom(1, 1, 1, chatMessage[0]._id),
    generateChatRoom(2, 1, 2, chatMessage[1]._id),
    generateChatRoom(3, 1, 3, chatMessage[2]._id),
    generateChatRoom(4, 2, 4, chatMessage[3]._id),
    generateChatRoom(5, 2, 5, chatMessage[4]._id),
    generateChatRoom(6, 2, 6, chatMessage[5]._id),
  ]);
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
  await ChatRoomSchema.updateOne({
    messageId,
  }, {
    updatedAt: moment.utc(),
  });
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
const getSelfSocket = async (socketId, time = 0) => {
  const selfSocketId = await SocketSchema.findOne({
    socketId,
  });

  if (time > 10) {
    return null;
  } else if (!selfSocketId) {
    const newTime = time + 1;
    const result = await getSelfSocket(socketId, newTime);
    return result;
  } else {
    return selfSocketId;
  }
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
        } else if (moment.utc(decoded.exp) < moment.utc()) {
          const newToken = await tokenHelper.getUserToken(user);
          foundToken.destroy();
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
        } else if (moment.utc(decoded.exp) < moment.utc()) {
          const newToken = await tokenHelper.getOperatorToken(operator);
          foundToken.destroy();
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
const mobileCheckPlansToChat = async (userId) => {
  try {
    const foundUser = await Users.findOne({
      attributes: [],
      where: {
        id: {
          [op.eq]: userId,
        },
      },
      include: [{
        model: Plans,
        as: 'plan',
      }],
    });

    if (!foundUser.plan.dataValues) return false;
    else if (!foundUser.plan.dataValues.chatEnabled) return false;
    else if (moment.utc(foundUser.plan.dataValues.startAt) > moment.utc()) return false;
    else if (moment.utc(foundUser.plan.dataValues.endAt) < moment.utc()) return false;
    else return true;
  } catch (err) {
    return false;
  }
};
const payloadValidator = async (socketCallback, payload, keys, next) => {
  if (!socketCallback) return;
  else if (typeof payload !== 'object') {
    socketCallback({
      ok: false,
      message: 'do not forget parameter!!',
    });
    return;
  }
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
const sendChatToOperator = async (io, requestId, operatorId, userId, chat, newChatroom) => {
  const operatorSocketIds = await SocketSchema.find({
    $or: [{
      userId: operatorId,
    }, {
      roleId: constant.ROLE.ADMINISTRATOR,
    }],
    roleId: {
      $ne: constant.ROLE.USER,
    },
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
      newChatroom,
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
  forEach(operatorSocketIds, (targetSocketId) => {
    io.sockets.connected[targetSocketId.socketId].emit('web-chat', {
      ok: true,
      data: {
        _id: chat._id,
        message: chat.message,
        request: {
          id: request.id,
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
        request: {
          id: request.id,
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
    $or: [{
      userId: operatorId,
    }, {
      roleId: constant.ROLE.ADMINISTRATOR,
    }],
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
    }, {
      model: Users,
      as: 'user',
      attributes: ['id', 'fullName', 'imagePath'],
    }],
  });

  forEach(selfSocketIds, (SSID) => {
    io.sockets.connected[SSID.socketId].emit('web-self-chat', {
      ok: true,
      data: {
        _id: chat._id,
        message: chat.message,
        user: request.dataValues.user.dataValues,
        request: {
          id: request.id,
          carrier: request.dataValues.carrier.dataValues,
        },
        createdAt: chat.createdAt,
      },
    });
  });
};
const mobileChat = async (io, socket, payload, socketCallback) => {
  try {
    const foundSocketId = await getSelfSocket(socket.id);

    if (foundSocketId.roleId !== constant.ROLE.USER) throw new CustomError('ChatError', 'forbidden for chat');
    else if (!await mobileCheckPlansToChat(foundSocketId.userId)) throw new CustomError('ChatError', 'forbidden for chat, upgrade to pro to use this feature');
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
        let newChatroom = false;

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
          newChatroom = true;
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
        sendChatToOperator(io, lastRequest.id, lastRequest.operatorId, foundSocketId.userId, storedChat, newChatroom);
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
    const foundSocketId = await getSelfSocket(socket.id);
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
    else if (request.operatorId !== foundSocketId.userId && foundSocketId.roleId === constant.ROLE.OPERATOR) throw new CustomError('ChatError', 'forbidden for this request');
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
    const foundSocketId = await getSelfSocket(socket.id);

    if (foundSocketId.roleId !== constant.ROLE.USER) throw new CustomError('ChatError', 'forbidden for chat');
    else if (!await mobileCheckPlansToChat(foundSocketId.userId)) throw new CustomError('ChatError', 'forbidden for chat, upgrade to pro to use this feature');
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
            $match: {},
          }, {
            $unwind: '$data',
          }, {
            $sort: {
              'data.createdAt': -1,
            },
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
                  request: {
                    id: lastRequest.id,
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

          result[0].data = result[0].data.slice(payload.existChat, payload.existChat + apiConfig.chat.loadOldChat);

          socketCallback({
            ok: true,
            data: result[0] ? result[0].data : [],
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
    const foundSocketId = await getSelfSocket(socket.id);

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
        }, {
          model: Users,
          as: 'user',
          attributes: ['id', 'fullName', 'imagePath'],
        }],
      });

      if (!request) throw new CustomError('ChatError', 'request does not exist');
      else if (!request.operatorId) throw new CustomError('ChatError', 'request is not accept');
      else if (request.operatorId !== foundSocketId.userId && foundSocketId.roleId === constant.ROLE.OPERATOR) throw new CustomError('ChatError', 'request is not your');
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
            $sort: {
              'data.createdAt': -1,
            },
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
                  user: request.dataValues.user.dataValues,
                  createdAt: '$data.createdAt',
                  request: {
                    id: request.id,
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

          result[0].data = result[0].data.slice(payload.existChat, payload.existChat + apiConfig.chat.loadOldChat);

          socketCallback({
            ok: true,
            data: result[0] ? result[0].data : [],
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
const updateReadStatus = async (socket, payload, socketCallback) => {
  try {
    const selfSocketId = await SocketSchema.findOne({
      socketId: socket.id,
    });

    if (selfSocketId.roleId === constant.ROLE.USER) throw new CustomError('ChatError', 'forbidden for this fuction');
    else {
      const chatroom = await ChatRoomSchema.findOne({
        operatorId: selfSocketId.userId,
        requestId: payload.requestId,
      });

      if (!chatroom.messageId) throw new CustomError('ChatError', 'forbidden for this function, chatroom has not created');
      else {
        await ChatMessageSchema.updateOne({
          _id: chatroom.messageId,
        }, {
          $set: {
            'read.operator': true,
          },
        });

        socketCallback({
          ok: true,
        });
      }
    }
  } catch (err) {
    socketCallback({
      ok: false,
      error: err,
    });
  }
};
const getCountOfUnreadMessage = async (socket, payload, socketCallback) => {
  try {
    const selfSocketId = await SocketSchema.findOne({
      socketId: socket.id,
    });

    if (selfSocketId.roleId === constant.ROLE.USER) throw new Error('ChatError', 'forbidden for this function');
    else {
      const result = await ChatRoomSchema.aggregate([{
        $lookup: {
          from: 'chatmessages',
          localField: 'messageId',
          foreignField: '_id',
          as: 'chat',
        },
      }, {
        $unwind: '$chat',
      }, {
        $match: {
          operatorId: selfSocketId.userId,
          messageId: {
            $ne: null,
          },
          'chat.read.operator': false,
        },
      }]);

      socketCallback({
        ok: true,
        data: result.length,
      });
    }
  } catch (err) {
    socketCallback({
      ok: false,
      error: err,
    });
  }
};
const searchChatRoom = async (socket, payload, socketCallback) => {
  try {
    const selfSocketId = await getSelfSocket(socket.id);

    if (selfSocketId.roleId === constant.ROLE.USER) throw new CustomError('ChatError', 'forbidden for chat list');
    else {
      const foundUsers = await Users.findAll({
        attributes: ['id'],
        where: {
          fullName: {
            [op.like]: `%${payload.searchText}%`,
          },
        },
      });

      if (!foundUsers.length) {
        socketCallback({
          ok: true,
          data: foundUsers,
        });
      } else {
        const foundUserIds = await Promise.all(foundUsers.map(async (e) => e.id));
        let chatroom = await ChatRoomSchema.aggregate([{
          $match: {
            activated: true,
            userId: {
              $in: foundUserIds,
            },
            ...selfSocketId.roleId === constant.ROLE.ADMINISTRATOR ? {} : { operatorId: selfSocketId.userId },
            messageId: {
              $ne: null,
            },
          },
        }, {
          $sort: {
            updatedAt: -1,
          },
        }, {
          $lookup: {
            from: 'chatmessages',
            localField: 'messageId',
            foreignField: '_id',
            as: 'chat',
          },
        }, {
          $unwind: '$chat',
        }, {
          $project: {
            _id: '$_id',
            request: {
              id: '$requestId',
            },
            chat: {
              _id: '$chat.id',
              read: '$chat.read',
              data: {
                $arrayElemAt: ['$chat.data', -1],
              },
            },
          },
        }]);

        chatroom = chatroom.slice(payload.existChatList, payload.existChatList + apiConfig.chat.loadOldChat);

        const result = await Promise.all(chatroom.map(async (value) => {
          const request = await Requests.findOne({
            attributes: ['id'],
            where: {
              id: {
                [op.eq]: value.request.id,
              },
            },
            include: [{
              model: Carriers,
              as: 'carrier',
              attributes: ['id', 'name'],
            }],
          });
          const user = await Users.findOne({
            attributes: ['id', 'fullName', 'imagePath'],
            where: {
              id: {
                [op.eq]: value.chat.data.userId,
              },
            },
          });
          const operator = await Operators.findOne({
            attributes: ['id', 'fullName', 'imagePath'],
            where: {
              id: {
                [op.eq]: value.chat.data.operatorId,
              },
            },
          });
          const temp = {
            request: request.dataValues,
            chat: {
              _id: value.chat.data._id,
              read: value.chat.read,
              message: value.chat.data.message,
              operator: operator.dataValues,
              user: user.dataValues,
              senderRoleId: value.chat.data.senderRoleId,
              createdAt: value.chat.data.createdAt,
            },
          };
          return temp;
        }));

        socketCallback({
          ok: true,
          data: result,
        });
      }
    }
  } catch (err) {
    socketCallback({
      ok: false,
      error: err,
    });
  }
};

// MOBILE NOTIFICATION
const getUserSocketId = async (userId) => {
  try {
    const socketIds = (await SocketSchema.find({
      userId,
      roleId: constant.ROLE.USER,
    })).map((e) => e.socketId);

    return socketIds;
  } catch (err) {
    return err;
  }
};
const sendNotification = async (data, userId) => {
  const socketIds = await getUserSocketId(userId);

  forEach(socketIds, (socketId) => {
    IO.sockets.connected[socketId].emit('notification', data);
  });
};
// WEB NOTIFICATION
const getUserId = (userId) => (!userId ? {} : { userId });
const sendWebNotification = async (event, data, userId = null) => {
  const socketIds = (await SocketSchema.find({
    ...getUserId(userId),
    roleId: {
      $ne: constant.ROLE.USER,
    },
  })).map((e) => e.socketId);

  forEach(socketIds, (socketId) => {
    IO.sockets.connected[socketId].emit(event, data);
  });
};

// GET #NEW-REQUESTS
const getCountOfNewRequest = async (socketCallback) => {
  try {
    const newRequest = await Requests.count({
      where: {
        status: {
          [op.eq]: 'Pending',
        },
      },
    });

    socketCallback({
      ok: true,
      data: newRequest,
    });
  } catch (err) {
    socketCallback({
      ok: false,
      error: err,
    });
  }
};

// SERVER
const chatServer = (server) => {
  clear();
  clearSockets();
  IO = socketio(server);

  IO.on('connection', async (socket) => {
    await authorization(socket, async () => {
      socket
        .on('mobile-chat', (payload, socketCallback) => payloadValidator(socketCallback, payload, ['text'], () => {
          mobileChat(IO, socket, payload, socketCallback);
        }))
        .on('mobile-old-chat', (payload, socketCallback) => payloadValidator(socketCallback, payload, ['existChat'], () => {
          getMobileOldChat(socket, payload, socketCallback);
        }))
        .on('web-chat', (payload, socketCallback) => payloadValidator(socketCallback, payload, ['text', 'requestId'], () => {
          webChat(IO, socket, payload, socketCallback);
        }))
        .on('web-old-chat', (payload, socketCallback) => payloadValidator(socketCallback, payload, ['existChat', 'requestId'], () => {
          getWebOldChat(socket, payload, socketCallback);
        }))
        .on('web-read-chat', (payload, socketCallback) => payloadValidator(socketCallback, payload, ['requestId'], () => {
          updateReadStatus(socket, payload, socketCallback);
        }))
        .on('web-count-unread-chat', (payload, socketCallback) => getCountOfUnreadMessage(socket, payload, socketCallback))
        .on('web-search-chatroom', (payload, socketCallback) => payloadValidator(socketCallback, payload, ['searchText', 'existChatList'], () => {
          searchChatRoom(socket, payload, socketCallback);
        }))
        .on('web-new-request', (payload, socketCallback) => getCountOfNewRequest(socketCallback))
        .on('disconnect', () => removeSocketId(socket.id));
    });
  });
};

module.exports = {
  chat: chatServer,
  sendNotification,
  sendWebNotification,
};
