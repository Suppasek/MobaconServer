const Sequelize = require('sequelize');

const {
  Roles,
  Operators,
} = require('../models');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');

const op = Sequelize.Op;

// METHODS


// CONTROLLER METHODS
const getOperators = async (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const operators = await Operators.findAll({
          attributes: [
            'id',
            'fullName',
            'phoneNumber',
            'email',
            'imagePath',
            'verified',
            'activated',
            [Sequelize.literal('(SELECT COUNT(Offers.liked) FROM (Requests LEFT JOIN Offers ON ((Requests.offerId=Offers.id))) WHERE ((Requests.operatorId=Operators.id) AND (Offers.liked=1)))'), 'like'],
            [Sequelize.literal('(SELECT COUNT(Offers.liked) FROM (Requests LEFT JOIN Offers ON ((Requests.offerId=Offers.id))) WHERE ((Requests.operatorId=Operators.id) AND (Offers.liked=0)))'), 'dislike'],
          ],
          include: [{
            model: Roles,
            as: 'role',
            attributes: ['id', 'name'],
          }],
        });

        res.status(200).json({
          token: newToken,
          operators,
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
const getOperatorById = async (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const foundOperator = await Operators.findOne({
          attributes: [
            'id',
            'fullName',
            'phoneNumber',
            'email',
            'imagePath',
            'verified',
            'activated',
            [Sequelize.literal('(SELECT COUNT(Offers.liked) FROM (Requests LEFT JOIN Offers ON ((Requests.offerId=Offers.id))) WHERE ((Requests.operatorId=Operators.id) AND (Offers.liked=1)))'), 'like'],
            [Sequelize.literal('(SELECT COUNT(Offers.liked) FROM (Requests LEFT JOIN Offers ON ((Requests.offerId=Offers.id))) WHERE ((Requests.operatorId=Operators.id) AND (Offers.liked=0)))'), 'dislike'],
          ],
          where: {
            id: {
              [op.eq]: req.params.userId,
            },
          },
          include: [{
            model: Roles,
            as: 'role',
            attributes: ['id', 'name'],
          }],
        });

        if (!foundOperator) {
          res.status(404).json({
            token: newToken,
            message: 'user not found',
          });
        } else {
          res.status(200).json({
            token: newToken,
            operator: foundOperator,
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

module.exports = {
  getOperators,
  getOperatorById,
};
