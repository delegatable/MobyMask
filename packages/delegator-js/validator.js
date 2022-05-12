const types = require('./types')
const createTypedMessage = require('./createTypedMessage');
const sigUtil = require('@metamask/eth-sig-util');
const { abi } = require('./artifacts');
const CONTRACT_NAME = 'PhisherRegistry';

exports.recoverSigner = function recoverSigner (signedDelegation, contractInfo) {
  const { chainId, verifyingContract, name } = contractInfo;
  types.domain.chainId = chainId;
  types.domain.verifyingContract = verifyingContract;
  const typedMessage = createTypedMessage(verifyingContract, signedDelegation.delegation, 'Delegation', name, chainId);

  const signer = sigUtil.recoverTypedSignature({
    data: typedMessage.data,
    signature: signedDelegation.signature,
    version: 'V4',
  });
  return signer;
}

