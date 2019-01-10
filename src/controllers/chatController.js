const mongoose = require('mongoose');
const Sequelize = require('sequelize');

const {
  Users,
  Operators,
  Requests,
  Carriers,
} = require('../models');
const ChatRoomSchema = require('../mongoSchema/chatRoomSchema');
const ChatMessageSchema = require('../mongoSchema/chatMessageSchema');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');
const config = require('../config/APIConfig');

const op = Sequelize.Op;
const mongooseTypes = mongoose.Types;

const getChatHistoryByUserId = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const chatHistory = await ChatRoomSchema.aggregate([{
          $match: {
            userId: (Number)(req.params.userId),
          },
        }, {
          $sort: {
            createdAt: -1,
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
            chatroomId: '$messageId',
            chat: {
              _id: '$chat.id',
              data: {
                $arrayElemAt: ['$chat.data', -1],
              },
            },
          },
        }]);

        const result = await Promise.all(chatHistory.map(async (value) => {
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
          const foundOperator = await Operators.findOne({
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
              chatroomId: value.chatroomId,
              _id: value.chat.data._id,
              read: value.chat.read,
              message: value.chat.data.message,
              operator: foundOperator.dataValues,
              senderRoleId: value.chat.data.senderRoleId,
              createdAt: value.chat.data.createdAt,
            },
          };
          return temp;
        }));

        res.status(200).json({
          data: result,
        });
      } catch (err) {
        if (err.errors) {
          res.status(400).json({
            token: newToken,
            message: err.errors[0].message,
          });
        } else {
          res.status(500).json({
            token: newToken,
            message: 'Internal server error',
          });
        }
      }
    });
  });
};
const getOldChatByChatRoomId = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const chatroom = await ChatRoomSchema.findOne({
          messageId: req.params.chatroomId,
        });
        const request = await Requests.findOne({
          where: {
            id: {
              [op.eq]: chatroom.requestId,
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
          }, {
            model: Operators,
            as: 'operator',
            attributes: ['id', 'fullName', 'imagePath'],
          }],
        });

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
                createdAt: '$data.createdAt',
                user: request.dataValues.user.dataValues,
                operator: request.dataValues.operator.dataValues,
                request: {
                  id: request.id,
                  carrier: request.dataValues.carrier.dataValues,
                },
              },
            },
          },
        }, {
          $match: {
            _id: mongooseTypes.ObjectId(req.params.chatroomId),
          },
        }]);

        result[0].data = result[0].data.slice((Number)(req.params.existChat), (Number)(req.params.existChat) + config.chat.loadOldChat);

        res.status(200).json({
          token: newToken,
          data: result.length > 0 ? result[0] : null,
        });
      } catch (err) {
        res.status(500).json({
          token: newToken,
          message: 'Internal server error',
        });
      }
    });
  });
};

module.exports = {
  getChatHistoryByUserId,
  getOldChatByChatRoomId,
};
