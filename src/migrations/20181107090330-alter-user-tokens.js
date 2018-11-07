module.exports = {
  up: (queryInterface) => queryInterface.addIndex('UserTokens', { fields: ['token'], name: 'userTokens_token_idx' })
    .then(() => queryInterface.addIndex('UserTokens', { fields: ['expired'], name: 'userTokens_expired_idx' })),
  down: (queryInterface) => queryInterface.removeIndex('UserTokens', 'userTokens_token_idx')
    .then(() => queryInterface.removeIndex('UserTokens', 'userTokens_expired_idx')),
};
