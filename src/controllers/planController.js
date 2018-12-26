const moment = require('moment');
const Sequelize = require('sequelize');

const { Plans } = require('../models');
const constant = require('../config/APIConstant');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');

const op = Sequelize.Op;

// METHODS


// CONTROLLER METHODS
const getPlans = async (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const plans = await Plans.findAll({
          attributes: ['id', 'name', 'chatEnabled', 'historyEnabled', 'startAt', 'endAt'],
        });

        res.status(200).json({
          token: newToken,
          plans,
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
const updatePlan = async (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      validationHelper.bodyValidator(req, res, [['chatEnabled', 'boolean'], ['historyEnabled', 'boolean']], async () => {
        if (req.body.chatEnabled || req.body.historyEnabled) {
          validationHelper.bodyValidator(req, res, ['startAt', 'endAt'], async () => {
            try {
              await Plans.update({
                chatEnabled: req.body.chatEnabled,
                historyEnabled: req.body.historyEnabled,
                startAt: moment.utc(req.body.startAt),
                endAt: moment.utc(req.body.endAt),
              }, {
                where: {
                  id: {
                    [op.eq]: constant.PLAN.BASIC,
                  },
                },
              });

              res.status(200).json({
                token: newToken,
                message: 'update plan successfully',
              });
            } catch (err) {
              res.status(500).json({
                token: newToken,
                message: 'Internal server error',
              });
            }
          });
        } else {
          try {
            await Plans.update({
              chatEnabled: req.body.chatEnabled,
              historyEnabled: req.body.historyEnabled,
            }, {
              where: {
                id: {
                  [op.eq]: constant.PLAN.BASIC,
                },
              },
            });

            res.status(200).json({
              token: newToken,
              message: 'update plan successfully',
            });
          } catch (err) {
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
  getPlans,
  updatePlan,
};
