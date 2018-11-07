module.exports = {
  up: (queryInterface) => queryInterface.addIndex('StaffTokens', { fields: ['token'], name: 'staffTokens_token_idx' })
    .then(() => queryInterface.addIndex('StaffTokens', { fields: ['expired'], name: 'staffTokens_expired_idx' })),
  down: (queryInterface) => queryInterface.removeIndex('StaffTokens', 'staffTokens_token_idx')
    .then(() => queryInterface.removeIndex('StaffTokens', 'staffTokens_expired_idx')),
};
