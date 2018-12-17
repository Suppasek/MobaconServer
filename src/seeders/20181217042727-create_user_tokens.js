module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('UserTokens', [{
    id: 1,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxMywicm9sZSI6eyJpZCI6MywibmFtZSI6IlVzZXIifSwicGxhbiI6eyJpZCI6MSwibmFtZSI6IkJhc2ljIn0sImZ1bGxOYW1lIjoiTW9iYWNvbiBNLiBUZXN0IiwicGhvbmVOdW1iZXIiOiIwODAwMDAwMDEzIiwiaW1hZ2VQYXRoIjpudWxsfSwiZXhwIjoxNTQ3NjEzMDA4MTgyLCJpYXQiOjE1NDUwMjEwMDh9.wFPVjLqTKx9JLO81MGJijMyFa1YhsVerbO_IzkXGGWQ',
    banned: false,
    createdBy: 13,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }]),
  down: (queryInterface) => queryInterface.bulkDelete('UserTokens', null, {}),
};
