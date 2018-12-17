module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('OperatorTokens', [{
    id: 1,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJyb2xlIjp7ImlkIjoxLCJuYW1lIjoiQWRtaW5pc3RyYXRvciJ9LCJmdWxsTmFtZSI6Ik1vYmFjb24gQWRtaW5pc3RyYXRvciIsInBob25lTnVtYmVyIjpudWxsLCJlbWFpbCI6ImFkbWluQG1vYmFjb24uY29tIiwiaW1hZ2VQYXRoIjoiL21vYmFjb24vYXBpL3dlYi9vcGVyYXRvci9pbWFnZS9kZWZhdWx0X3Byb2ZpbGUucG5nIn0sImV4cCI6MTU0NzYyMzk0MjM3MSwiaWF0IjoxNTQ1MDMxOTQyfQ.lFf_OUjMnBtx7fq3Sg4XcrI2yKdF1dmjiYhYoGOWbQs',
    createdBy: 1,
    createdAt: Sequelize.fn('NOW'),
    updatedAt: Sequelize.fn('NOW'),
  }]),
  down: (queryInterface) => queryInterface.bulkDelete('OperatorTokens', null, {}),
};
