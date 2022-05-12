const { types } = require('./types');

module.exports = function createTypedMessage (verifyingContractAddress, message, primaryType, CONTRACT_NAME, _chainId) {
  const chainId = _chainId;
  return { data: {
    types,
    primaryType,
    domain: {
      name: CONTRACT_NAME,
      version: '1',
      chainId,
      verifyingContract: verifyingContractAddress,
    },
    message,
  }};
}
