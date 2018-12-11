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
const db = require('../models/index');
const constant = require('../config/APIConstant');
const billSchema = require('../mongoSchema/billSchema');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');

const op = Sequelize.Op;

// METHODS
const getPage = async (page, limit) => {
  if ((Number)(page) && (Number)(limit)) {
    return ((Number)(page) - 1) * (Number)(limit);
  } else {
    return undefined;
  }
};

// CONTROLLER METHODS
const getRequests = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const recordsTotal = await Requests.count({});
        const requests = await Requests.findAll({
          offset: await getPage(req.query.page, req.query.limit),
          limit: (Number)(req.query.limit) || undefined,
          order: [
            Sequelize.fn('field', Sequelize.col('status'), 'Accepted', 'Reviewed', 'Pending'),
            ['createdAt', 'DESC'],
            ['id', 'ASC'],
          ],
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
          res.status(404).json({
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
          res.status(404).json({
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
            res.status(404).json({
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
            res.status(404).json({
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
              status: 'Reviewed',
            });

            res.status(201).json({
              token: newToken,
              message: 'update review successfully',
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

        const bills = await billSchema.find({
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
        console.log(err);
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
  getRequests,
  getAcceptedRequests,
  getRequestById,
  requestAcceptance,
  putRequestMemoById,
  createRequestReviewById,
  getBillByUserId,
  getReviewByUserId,
};
