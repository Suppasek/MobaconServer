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
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');
const constant = require('../config/APIConstant');

const op = Sequelize.Op;

// METHODS


// CONTROLLER METHODS
const getRequests = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const requests = await Requests.findAll({
          where: {

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
          }],
        });
        res.status(200).json({
          token: newToken,
          recordsTotal: requests.length,
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
        const requests = await Requests.findAll({
          where: {
            operatorId: {
              [op.eq]: operator.id,
            },
            status: {
              [op.eq]: constant.REQUEST_STATUS.ACCEPTED,
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
          }],
        });
        res.status(200).json({
          token: newToken,
          recordsTotal: requests.length,
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
        const request = await Requests.findAll({
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
        res.status(200).json({
          token: newToken,
          recordsTotal: request.length,
          data: request,
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
const putRequesReviewById = (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      validationHelper.bodyValidator(req, res, ['minutes', 'sms', 'internet', 'cloudStorage'], async () => {
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
          } else if (!request.offerId) {
            const newOffer = await Offers.create({
              minutes: req.body.minutes,
              sms: req.body.sms,
              internet: req.body.internet,
              cloudStorage: req.body.cloudStorage,
            });
            await request.update({
              offerId: newOffer.id,
              status: 'Reviewed',
            });

            res.status(200).json({
              token: newToken,
              message: 'update review successfully',
            });
          } else {
            await Offers.update({
              minutes: req.body.minutes,
              sms: req.body.sms,
              internet: req.body.internet,
              cloudStorage: req.body.cloudStorage,
            }, {
              where: {
                id: {
                  [op.eq]: request.offerId,
                },
              },
            });

            res.status(200).json({
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

module.exports = {
  getRequests,
  getAcceptedRequests,
  getRequestById,
  requestAcceptance,
  putRequestMemoById,
  putRequesReviewById,
};
