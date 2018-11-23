const Sequelize = require('sequelize');

const { Plans } = require('../models');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');

const op = Sequelize.Op;

// METHODS


// CONTROLLER METHODS
const getPlans = async (req, res) => {
  passportService.checkJwtFailures(req, res, async (operator, newToken) => {
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
  passportService.checkJwtFailures(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      validationHelper.bodyValidator(req, res, [['chatEnabled', 'boolean'], ['historyEnabled', 'boolean']], async () => {
        try {
          if (req.body.historyEnabled) {
            validationHelper.bodyValidator(req, res, ['startAt', 'endAt'], async () => {
              try {
                await Plans.update({
                  chatEnabled: req.body.chatEnabled,
                  historyEnabled: req.body.historyEnabled,
                  startAt: req.body.startAt,
                  endAt: req.body.endAt,
                }, {
                  where: {
                    id: {
                      [op.eq]: req.params.planId,
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
            await Plans.update({
              chatEnabled: req.body.chatEnabled,
              historyEnabled: req.body.historyEnabled,
            }, {
              where: {
                id: {
                  [op.eq]: req.params.planId,
                },
              },
            });

            res.status(200).json({
              token: newToken,
              message: 'update plan successfully',
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
  });
};

module.exports = {
  getPlans,
  updatePlan,
};
