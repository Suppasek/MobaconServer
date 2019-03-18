const moment = require('moment');
const Sequelize = require('sequelize');

const { Users, Requests, Offers } = require('../models');
const ChatRoomSchema = require('../mongoSchema/chatRoomSchema');
const constant = require('../config/APIConstant');
const passportService = require('./services/passportService');
const validationHelper = require('../helpers/validationHelper');

const op = Sequelize.Op;

// METHODS
// GET DAYS FOR FILTERING
const getDayInLastOneMonth = () => {
  const days = [];
  const currentDay = (Number)(moment.utc().format('DD'));
  for (let i = 0; i < currentDay; i += 1) {
    days[i] = moment.utc().add(-i, 'days').format('YYYY-MM-DD');
  }
  days.reverse();
  return days;
};
const getDayInLastMonth = (numberOfMonth) => {
  const months = [];
  const currentStartDayOfMonth = moment.utc().startOf('month').format('YYYY-MM-DD HH:mm:ss');
  const currentEndDayOfMonth = moment.utc().endOf('month').format('YYYY-MM-DD HH:mm:ss');

  months[0] = {
    startAt: currentStartDayOfMonth,
    endAt: currentEndDayOfMonth,
  };

  for (let i = 1; i < numberOfMonth; i += 1) {
    months[i] = {
      startAt: moment.utc(currentStartDayOfMonth).subtract(i, 'months').format('YYYY-MM-DD HH:mm:ss'),
      endAt: moment.utc(currentEndDayOfMonth).subtract(i, 'months').format('YYYY-MM-DD HH:mm:ss'),
    };
  }
  months.reverse();

  return months;
};

// GET TOTAL INFORMATION
const getTotalInformation = async () => {
  const user = Users.count();
  const request = Requests.count();
  const chat = ChatRoomSchema.countDocuments();
  const good = Offers.count({
    where: {
      liked: {
        [op.eq]: 1,
      },
    },
  });
  const bad = Offers.count({
    where: {
      liked: {
        [op.eq]: 0,
      },
    },
  });

  const result = await Promise.all([
    user,
    request,
    chat,
    good,
    bad,
  ]);

  return {
    user: result[0] || 0,
    request: result[1] || 0,
    chat: result[2] || 0,
    goodness: {
      good: result[3] || 0,
      bad: result[4] || 0,
    },
  };
};

// FOR #USERS
const getUserDashboardInformationForOneMonth = async () => {
  const days = getDayInLastOneMonth();

  const result = await Promise.all(days.map(async (e) => {
    const count = await Users.count({
      where: {
        createdAt: {
          [op.between]: [`${e} 00:00:00`, `${e} 23:59:59`],
        },
      },
    });

    return {
      x: e,
      y: count,
    };
  }));

  return result;
};
const getUserDashboardInformationByNumberOfMonth = async (numberOfMonth) => {
  const months = getDayInLastMonth(numberOfMonth);

  const result = await Promise.all(months.map(async (e) => {
    const count = await Users.count({
      where: {
        createdAt: {
          [op.between]: [`${e.startAt}`, `${e.endAt}`],
        },
      },
    });

    return {
      x: e.startAt,
      y: count,
    };
  }));

  return result;
};
const getUserDashboardInformation = async (month) => {
  let result = [];
  if (month === '1') {
    result = await getUserDashboardInformationForOneMonth();
  } else if (month === '3') {
    result = await getUserDashboardInformationByNumberOfMonth(3);
  } else if (month === '6') {
    result = await getUserDashboardInformationByNumberOfMonth(6);
  } else if (month === '12') {
    result = await getUserDashboardInformationByNumberOfMonth(12);
  }

  return result;
};

// FOR #ANALYZED-REQUESTS
const getAnalyzedRequestDashboardInformationForOneMonth = async () => {
  const days = getDayInLastOneMonth();

  const result = await Promise.all(days.map(async (e) => {
    const count = await Requests.count({
      where: {
        status: {
          [op.eq]: constant.REQUEST_STATUS.REVIEWED,
        },
        createdAt: {
          [op.between]: [`${e} 00:00:00`, `${e} 23:59:59`],
        },
      },
    });

    return {
      x: e,
      y: count,
    };
  }));

  return result;
};
const getAnalyzedRequestDashboardInformationByNumberOfMonth = async (numberOfMonth) => {
  const months = getDayInLastMonth(numberOfMonth);

  const result = await Promise.all(months.map(async (e) => {
    const count = await Requests.count({
      where: {
        status: {
          [op.eq]: constant.REQUEST_STATUS.REVIEWED,
        },
        createdAt: {
          [op.between]: [`${e.startAt}`, `${e.endAt}`],
        },
      },
    });

    return {
      x: e.startAt,
      y: count,
    };
  }));

  return result;
};
const getAnalyzedRequestDashboardInformation = async (month) => {
  let result = [];
  if (month === '1') {
    result = await getAnalyzedRequestDashboardInformationForOneMonth();
  } else if (month === '3') {
    result = await getAnalyzedRequestDashboardInformationByNumberOfMonth(3);
  } else if (month === '6') {
    result = await getAnalyzedRequestDashboardInformationByNumberOfMonth(6);
  } else if (month === '12') {
    result = await getAnalyzedRequestDashboardInformationByNumberOfMonth(12);
  }

  return result;
};

// FOR #ACTIVED-CHAT
const getActivedChatDashboardInformationForOneMonth = async () => {
  const days = getDayInLastOneMonth();

  const result = await Promise.all(days.map(async (e) => {
    const count = await ChatRoomSchema.countDocuments({
      messageId: {
        $ne: null,
      },
      $and: [{
        createdAt: {
          $gte: `${e} 00:00:00`,
        },
      }, {
        createdAt: {
          $lte: `${e} 23:59:59`,
        },
      }],
    });

    return {
      x: e,
      y: count,
    };
  }));

  return result;
};
const getActivedChatDashboardInformationByNumberOfMonth = async (numberOfMonth) => {
  const months = getDayInLastMonth(numberOfMonth);

  const result = await Promise.all(months.map(async (e) => {
    const count = await ChatRoomSchema.countDocuments({
      messageId: {
        $ne: null,
      },
      $and: [{
        createdAt: {
          $gte: `${e.startAt}`,
        },
      }, {
        createdAt: {
          $lte: `${e.endAt}`,
        },
      }],
    });

    return {
      x: e.startAt,
      y: count,
    };
  }));

  return result;
};
const getActivedChatDashboardInformation = async (month) => {
  let result = [];
  if (month === '1') {
    result = await getActivedChatDashboardInformationForOneMonth();
  } else if (month === '3') {
    result = await getActivedChatDashboardInformationByNumberOfMonth(3);
  } else if (month === '6') {
    result = await getActivedChatDashboardInformationByNumberOfMonth(6);
  } else if (month === '12') {
    result = await getActivedChatDashboardInformationByNumberOfMonth(12);
  }

  return result;
};

// FOR GOOD/BAD RATIO
const getGoodBadRatioDashboardInformationForOneMonth = async () => {
  const days = getDayInLastOneMonth();

  const result = await Promise.all(days.map(async (e) => {
    const good = await Offers.count({
      where: {
        liked: {
          [op.eq]: 1,
        },
        createdAt: {
          [op.between]: [`${e} 00:00:00`, `${e} 23:59:59`],
        },
      },
    });
    const bad = await Offers.count({
      where: {
        liked: {
          [op.eq]: 0,
        },
        createdAt: {
          [op.between]: [`${e} 00:00:00`, `${e} 23:59:59`],
        },
      },
    });

    return {
      x: e,
      y: {
        good,
        bad,
      },
    };
  }));

  return result;
};
const getGoodBadRatioDashboardInformationByNumberOfMonth = async (numberOfMonth) => {
  const months = getDayInLastMonth(numberOfMonth);

  const result = await Promise.all(months.map(async (e) => {
    const good = await Offers.count({
      where: {
        liked: {
          [op.eq]: 1,
        },
        createdAt: {
          [op.between]: [`${e.startAt}`, `${e.endAt}`],
        },
      },
    });
    const bad = await Offers.count({
      where: {
        liked: {
          [op.eq]: 0,
        },
        createdAt: {
          [op.between]: [`${e.startAt}`, `${e.endAt}`],
        },
      },
    });

    return {
      x: e.startAt,
      y: {
        good,
        bad,
      },
    };
  }));

  return result;
};
const getGoodBadRatioDashboardInformation = async (month) => {
  let result = [];
  if (month === '1') {
    result = await getGoodBadRatioDashboardInformationForOneMonth();
  } else if (month === '3') {
    result = await getGoodBadRatioDashboardInformationByNumberOfMonth(3);
  } else if (month === '6') {
    result = await getGoodBadRatioDashboardInformationByNumberOfMonth(6);
  } else if (month === '12') {
    result = await getGoodBadRatioDashboardInformationByNumberOfMonth(12);
  }

  return result;
};

// CONTROLLER METHODS
const getUserForDashboard = async (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const result = await getUserDashboardInformation(req.query.month);
        const total = await getTotalInformation();
        res.status(200).json({
          token: newToken,
          total,
          data: result,
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
const getRequestForDashboard = async (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const result = await getAnalyzedRequestDashboardInformation(req.query.month);
        const total = await getTotalInformation();
        res.status(200).json({
          token: newToken,
          total,
          data: result,
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
const getChatForDashboard = async (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const result = await getActivedChatDashboardInformation(req.query.month);
        const total = await getTotalInformation();
        res.status(200).json({
          token: newToken,
          total,
          data: result,
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
const getGoodRateForDashboard = async (req, res) => {
  passportService.webJwtAuthorize(req, res, async (operator, newToken) => {
    validationHelper.operatorValidator(req, res, operator, newToken, async () => {
      try {
        const result = await getGoodBadRatioDashboardInformation(req.query.month);
        const total = await getTotalInformation();
        res.status(200).json({
          token: newToken,
          total,
          data: result,
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
  getUserForDashboard,
  getRequestForDashboard,
  getChatForDashboard,
  getGoodRateForDashboard,
};
