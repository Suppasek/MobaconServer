const moment = require('moment');
const Sequelize = require('sequelize');

const {
  Roles,
  Operators,
  Users,
  Carriers,
  Requests,
  Memos,
  Offers,
  Plans,
} = require('../models');
const BillSchema = require('../mongoSchema/billSchema');
const ChatRoomSchema = require('../mongoSchema/chatRoomSchema');
const config = require('../config/APIConfig');
const constant = require('../config/APIConstant');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');
const notificationService = require('./services/socketService');

const op = Sequelize.Op;

// METHODS
const getPage = async (page, limit) => {
  if ((Number)(page) && (Number)(limit)) {
    return ((Number)(page) - 1) * (Number)(limit);
  } else {
    return undefined;
  }
};
const createNewChatRoom = async (requestId, userId, operatorId) => {
  await ChatRoomSchema.updateMany({
    userId,
    activated: true,
  }, {
    activated: false,
  });
  await ChatRoomSchema.create([{
    userId,
    operatorId,
    requestId,
  }]);
};
const findAcceptedRequestOfMonth = async (userId) => {
  const startOfMonth = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
  const endOfMonth = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss');

  const foundRequest = await Requests.findOne({
    where: {
      userId: {
        [op.eq]: userId,
      },
      status: {
        [op.eq]: constant.REQUEST_STATUS.ACCEPTED,
      },
      createdAt: {
        [op.between]: [startOfMonth, endOfMonth],
      },
    },
  });

  return !!foundRequest;
};
const removeOldPendingRequestAndBill = async (userId) => {
  const foundRequest = await Requests.findAll({
    attributes: ['billRef'],
    where: {
      userId: {
        [op.eq]: userId,
      },
      status: {
        [op.eq]: constant.REQUEST_STATUS.PENDING,
      },
    },
  });

  await Promise.all(foundRequest.map(async (e) => {
    await BillSchema.findByIdAndDelete(e.billRef);
  }));

  await Requests.destroy({
    where: {
      userId: {
        [op.eq]: userId,
      },
      status: {
        [op.eq]: constant.REQUEST_STATUS.PENDING,
      },
    },
  });
};
const createNewBill = async (userId, carrierId, xml) => {
  const createdBill = await BillSchema.create([{
    userId,
    carrier: carrierId,
    amount: 1000,
    used: {
      minutes: 100,
      sms: 20,
      internet: 50,
    },
    emissionAt: moment.utc(),
    paidAt: moment.utc(),
  }]);

  return createdBill;
};
const deactiveChatRoom = async (userId) => {
  await ChatRoomSchema.update({
    userId,
  }, {
    activated: false,
  });
};

// CONTROLLER METHODS
const createRequest = (req, res) => {
  passportService.mobileJwtAuthorize(req, res, async (user, newToken) => {
    validationHelper.userValidator(req, res, user, newToken, async () => {
      try {
        if (await findAcceptedRequestOfMonth(user.id)) {
          res.status(403).json({
            token: newToken,
            message: 'cannot create a new request, your previous request is accepted',
          });
        } else {
          await deactiveChatRoom(user.id);
          await removeOldPendingRequestAndBill(user.id);

          const createdBill = await createNewBill(user.id, req.params.carrierId, req.body);

          await Requests.create({
            userId: user.id,
            carrierId: req.params.carrierId,
            billRef: createdBill[0]._id.toString(),
            status: constant.REQUEST_STATUS.PENDING,
          });

          res.status(201).json({
            token: newToken,
            message: 'create a new request successfully',
          });
        }
      } catch (err) {
        res.status(500).json({
          token: newToken,
          message: 'Internal server error',
        });
      }
    });
  });
};
const getRequests = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const recordsTotal = await Requests.count({});
        const requests = await Requests.findAll({
          offset: await getPage(req.query.page, req.query.limit),
          limit: (Number)(req.query.limit) || undefined,
          order: [
            Sequelize.fn('field', Sequelize.col('status'), 'Pending', 'Accepted', 'Reviewed'),
            ['createdAt', 'DESC'],
            ['id', 'ASC'],
          ],
          attributes: ['id', 'billRef', 'status', 'createdAt'],
          include: [{
            model: Carriers,
            as: 'carrier',
            attributes: ['name'],
          }, {
            model: Users,
            as: 'user',
            attributes: ['id', 'fullName', 'createdAt'],
            include: [{
              model: Plans,
              as: 'plan',
              attributes: ['name'],
            }],
          }, {
            model: Operators,
            as: 'operator',
            attributes: ['id', 'fullName'],
          }],
        });
        res.status(200).json({
          token: newToken,
          recordsTotal,
          filteredTotal: requests.length,
          data: requests,
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
const getAcceptedRequests = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const recordsTotal = await Requests.count({
          where: {
            operatorId: {
              [op.eq]: operator.id,
            },
            [op.or]: [{
              status: {
                [op.eq]: constant.REQUEST_STATUS.ACCEPTED,
              },
            }, {
              status: {
                [op.eq]: constant.REQUEST_STATUS.REVIEWED,
              },
            }],
          },
        });
        const requests = await Requests.findAll({
          where: {
            operatorId: {
              [op.eq]: operator.id,
            },
            [op.or]: [{
              status: {
                [op.eq]: constant.REQUEST_STATUS.ACCEPTED,
              },
            }, {
              status: {
                [op.eq]: constant.REQUEST_STATUS.REVIEWED,
              },
            }],
          },
          offset: await getPage(req.query.page, req.query.limit),
          limit: (Number)(req.query.limit) || undefined,
          order: [
            Sequelize.fn('field', Sequelize.col('status'), 'Accepted', 'Reviewed'),
            ['createdAt', 'DESC'],
            ['id', 'ASC'],
          ],
          attributes: ['id', 'billRef', 'status', 'createdAt'],
          include: [{
            model: Carriers,
            as: 'carrier',
            attributes: ['name'],
          }, {
            model: Users,
            as: 'user',
            attributes: ['fullName', 'createdAt'],
            include: [{
              model: Plans,
              as: 'plan',
              attributes: ['name'],
            }],
          }, {
            model: Operators,
            as: 'operator',
            attributes: ['id', 'fullName'],
          }],
        });
        res.status(200).json({
          token: newToken,
          recordsTotal,
          filteredTotal: requests.length,
          data: requests,
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
const getRequestById = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const request = await Requests.findOne({
          where: {
            id: {
              [op.eq]: req.params.requestId,
            },
          },
          attributes: ['id', 'billRef', 'status', 'createdAt'],
          include: [{
            model: Carriers,
            as: 'carrier',
            attributes: ['id', 'name'],
          }, {
            model: Users,
            as: 'user',
            attributes: ['id', 'fullName', 'phoneNumber', 'imagePath', 'verified', 'createdAt'],
            include: [{
              model: Roles,
              as: 'role',
              attributes: ['id', 'name'],
            }, {
              model: Plans,
              as: 'plan',
              attributes: ['id', 'name'],
            }],
          }, {
            model: Operators,
            as: 'operator',
            attributes: ['id', 'fullName', 'phoneNumber', 'imagePath', 'verified', 'activated', 'createdAt'],
            include: [{
              model: Roles,
              as: 'role',
              attributes: ['id', 'name'],
            }],
          }, {
            model: Memos,
            as: 'memo',
          }, {
            model: Offers,
            as: 'offer',
          }],
        });

        if (!request) {
          res.status(400).json({
            token: newToken,
            message: 'request not found',
          });
        } else if (!request.operator) {
          res.status(403).json({
            token: newToken,
            message: 'request is not accepted',
          });
        } else if (request.operator.id !== operator.id) {
          res.status(403).json({
            token: newToken,
            message: 'request is not your',
          });
        } else {
          res.status(200).json({
            token: newToken,
            data: request,
          });
        }
      } catch (err) {
        res.status(500).json({
          token: newToken,
          message: 'Internal server error',
        });
      }
    });
  });
};
const requestAcceptance = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const request = await Requests.findOne({
          where: {
            id: {
              [op.eq]: req.params.requestId,
            },
          },
        });

        if (!request) {
          res.status(400).json({
            token: newToken,
            message: 'request not found',
          });
        } else if (request.operatorId) {
          res.status(403).json({
            token: newToken,
            message: 'request has accepted',
          });
        } else {
          await request.update({
            operatorId: operator.id,
            status: 'Accepted',
          });

          res.status(200).json({
            token: newToken,
            message: 'accept request successfully',
          });

          await createNewChatRoom(request.id, request.userId, operator.id);
          await notificationService.sendNotification({
            type: config.notification.acceptance.type,
            title: config.notification.acceptance.title,
            body: config.notification.acceptance.body,
          }, request.userId);
        }
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
const putRequestMemoById = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      validationHelper.bodyValidator(req, res, ['message'], async () => {
        try {
          const request = await Requests.findOne({
            where: {
              id: {
                [op.eq]: req.params.requestId,
              },
            },
          });

          if (!request) {
            res.status(400).json({
              token: newToken,
              message: 'request not found',
            });
          } else if (!request.operatorId) {
            res.status(403).json({
              token: newToken,
              message: 'request has not accepted',
            });
          } else if (request.operatorId !== operator.id) {
            res.status(403).json({
              token: newToken,
              message: 'request is not your',
            });
          } else if (!request.memoId) {
            const newMemo = await Memos.create({
              message: req.body.message,
            });
            await request.update({
              memoId: newMemo.id,
            });

            res.status(200).json({
              token: newToken,
              message: 'update memo successfully',
            });
          } else {
            await Memos.update({
              message: req.body.message,
            }, {
              where: {
                id: {
                  [op.eq]: request.memoId,
                },
              },
            });

            res.status(200).json({
              token: newToken,
              message: 'update memo successfully',
            });
          }
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
  });
};
const createRequestReviewById = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      validationHelper.bodyValidator(req, res, ['review', 'suggestion'], async () => {
        try {
          const request = await Requests.findOne({
            where: {
              id: {
                [op.eq]: req.params.requestId,
              },
            },
          });

          if (!request) {
            res.status(400).json({
              token: newToken,
              message: 'request not found',
            });
          } else if (!request.operatorId) {
            res.status(403).json({
              token: newToken,
              message: 'request has not accepted',
            });
          } else if (request.operatorId !== operator.id) {
            res.status(403).json({
              token: newToken,
              message: 'request is not your',
            });
          } else if (request.offerId) {
            res.status(403).json({
              token: newToken,
              message: 'request has reviewed',
            });
          } else {
            const newOffer = await Offers.create({
              review: req.body.review,
              suggestion: req.body.suggestion,
            });
            await request.update({
              offerId: newOffer.id,
              status: constant.REQUEST_STATUS.REVIEWED,
            });

            res.status(201).json({
              token: newToken,
              message: 'update review successfully',
            });
            notificationService.sendNotification({
              type: config.notification.review.type,
              title: config.notification.review.title,
              body: config.notification.review.body,
              data: newOffer.dataValues,
            }, request.userId);
          }
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
  });
};
const getBillByUserId = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const foundbills = await Requests.findAll({
          attributes: ['id', 'billRef'],
          where: {
            userId: {
              [op.eq]: req.params.userId,
            },
          },
        });

        const bills = await BillSchema.find({
          _id: {
            $in: await foundbills.map((bill) => bill.billRef),
          },
        });

        res.status(200).json(bills);
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
const getReviewByUserId = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const result = await Users.findOne({
          where: {
            id: {
              [op.eq]: req.params.userId,
            },
          },
          attributes: ['fullName'],
          order: [
            ['request', 'createdAt', 'DESC'],
          ],
          include: [{
            model: Requests,
            as: 'request',
            attributes: ['billRef', 'createdAt'],
            where: {
              offerId: {
                [op.ne]: null,
              },
            },
            include: [{
              model: Carriers,
              as: 'carrier',
              attributes: ['id', 'name'],
            }, {
              model: Offers,
              as: 'offer',
              attributes: ['review', 'suggestion', 'liked', 'createdAt'],
            }],
          }],
        });

        res.status(200).json({
          token: newToken,
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
const getReviewByRequestId = (req, res) => {
  passportService.mobileJwtAuthorize(req, res, async (user, newToken) => {
    validationHelper.userValidator(req, res, user, newToken, async () => {
      try {
        const lastRequest = await Requests.findOne({
          attributes: ['id', 'billRef'],
          where: {
            userId: {
              [op.eq]: user.id,
            },

          },
          include: [{
            model: Carriers,
            as: 'carrier',
            attributes: ['id', 'name'],
          }, {
            model: Offers,
            as: 'offer',
            attributes: ['review', 'suggestion', 'liked', 'createdAt'],
          }],
          order: [
            ['id', 'DESC'],
          ],
        });

        const bill = await BillSchema.findById(lastRequest.billRef).select('-__v').select('-carrier');
        delete lastRequest.dataValues.billRef;
        lastRequest.dataValues.bill = bill;

        res.status(200).json({
          token: newToken,
          data: lastRequest,
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
const likeReviewByRequestId = (req, res) => {
  passportService.mobileJwtAuthorize(req, res, async (user, newToken) => {
    validationHelper.userValidator(req, res, user, newToken, async () => {
      try {
        const foundRequest = await Requests.findOne({
          where: {
            id: {
              [op.eq]: req.params.requestId,
            },
          },
        });

        if (!foundRequest) {
          res.status(400).json({
            token: newToken,
            message: 'request not found',
          });
        } else if (foundRequest.userId !== user.id) {
          res.status(403).json({
            token: newToken,
            message: 'forbidden for request, request is not your',
          });
        } else {
          await Offers.update({
            liked: true,
          }, {
            where: {
              id: {
                [op.eq]: foundRequest.offerId,
              },
            },
          });

          res.status(200).json({
            token: newToken,
            message: 'like review successfully',
          });
        }
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
const dislikeReviewByRequestId = (req, res) => {
  passportService.mobileJwtAuthorize(req, res, async (user, newToken) => {
    validationHelper.userValidator(req, res, user, newToken, async () => {
      try {
        const foundRequest = await Requests.findOne({
          where: {
            id: {
              [op.eq]: req.params.requestId,
            },
          },
        });

        if (!foundRequest) {
          res.status(400).json({
            token: newToken,
            message: 'request not found',
          });
        } else if (foundRequest.userId !== user.id) {
          res.status(403).json({
            token: newToken,
            message: 'forbidden for request, request is not your',
          });
        } else {
          await Offers.update({
            liked: false,
          }, {
            where: {
              id: {
                [op.eq]: foundRequest.offerId,
              },
            },
          });

          res.status(200).json({
            token: newToken,
            message: 'dislike review successfully',
          });
        }
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

module.exports = {
  createRequest,
  getRequests,
  getAcceptedRequests,
  getRequestById,
  requestAcceptance,
  putRequestMemoById,
  createRequestReviewById,
  getBillByUserId,
  getReviewByUserId,
  getReviewByRequestId,
  likeReviewByRequestId,
  dislikeReviewByRequestId,
};
