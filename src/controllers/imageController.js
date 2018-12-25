const fs = require('fs');
const path = require('path');

const getDefaultProfileImage = (req, res) => {
  const imagePath = path.join(__dirname, `../../assets/images/default/${req.params.imageName}`);
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(400).json({
      message: 'image not found',
    });
  }
};
const getOperatorImage = (req, res) => {
  const imagePath = path.join(__dirname, `../../assets/images/operators/${req.params.imageName}`);
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(400).json({
      message: 'image not found',
    });
  }
};
const getUserImage = (req, res) => {
  const imagePath = path.join(__dirname, `../../assets/images/users/${req.params.imageName}`);
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(400).json({
      message: 'image not found',
    });
  }
};

module.exports = {
  getDefaultProfileImage,
  getOperatorImage,
  getUserImage,
};
