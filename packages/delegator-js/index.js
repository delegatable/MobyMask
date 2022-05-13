const types = require('./types')
const createTypedMessage = require('./createTypedMessage');
const sigUtil = require('@metamask/eth-sig-util');
const { abi } = require('./artifacts');
const CONTRACT_NAME = 'PhisherRegistry';

// Util curries contract info into a reusable utility
exports.generateUtil = function generateUtil (contractInfo) {
  return {
    recoverSigner: (signedDelegation) => exports.recoverSigner(signedDelegation, contractInfo),
    recoverDelegationSigner: (signedDelegation) => exports.recoverDelegationSigner(signedDelegation, contractInfo),
    signDelegation: (delegation, privateKey) => exports.signDelegation(delegation, privateKey, contractInfo),
    recoverInvocationSigner: (signedInvocation) => exports.recoverInvocationSigner(signedInvocation, contractInfo),
    signInvocation: (invocation, privateKey) => exports.signInvocation(invocation, privateKey, contractInfo),
  }
}

exports.recoverSigner = exports.recoverDelegationSigner;
exports.recoverDelegationSigner = function recoverDelegationSigner (signedDelegation, contractInfo) {
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

exports.recoverInvocationSigner = function recoverInvocationSigner (signedInvocation, contractInfo) {
  const { chainId, verifyingContract, name } = contractInfo;
  types.domain.chainId = chainId;
  types.domain.verifyingContract = verifyingContract;
  const typedMessage = createTypedMessage(verifyingContract, signedInvocation.invocations, 'Invocations', name, chainId);

  const signer = sigUtil.recoverTypedSignature({
    data: typedMessage.data,
    signature: signedInvocation.signature,
    version: 'V4',
  });
  return signer;
}

exports.signInvocation = function signInvocation(invocation, privateKey, contractInfo) {
  const { chainId, verifyingContract, name } = contractInfo;
  const typedMessage = createTypedMessage(verifyingContract, invocation, 'Invocations', name, chainId);

  const signature = sigUtil.signTypedData({
    privateKey: fromHexString(privateKey.indexOf('0x') === 0 ? privateKey.substring(2) : privateKey),
    data: typedMessage.data,
    version: 'V4',
  });

  const signedInvocation = {
    signature,
    invocations: invocation,
  }

  return signedInvocation;
}

exports.signDelegation = function signDelegation (delegation, privateKey, contractInfo) {
  const { chainId, verifyingContract, name } = contractInfo;
  const typedMessage = createTypedMessage(verifyingContract, delegation, 'Delegation', name, chainId);

  const signature = sigUtil.signTypedData({
    privateKey: fromHexString(privateKey.indexOf('0x') === 0 ? privateKey.substring(2) : privateKey),
    data: typedMessage.data,
    version: 'V4',
  });

  const signedDelegation = {
    signature,
    delegation,
  }

  return signedDelegation;
}

function fromHexString (hexString) {
  if (!hexString || typeof hexString !== 'string') {
    throw new Error('Expected a hex string.');
  }
  const matched = hexString.match(/.{1,2}/g)
  if (!matched) {
    throw new Error('Expected a hex string.');
  }
  const mapped = matched.map(byte => parseInt(byte, 16));
  if (!mapped || mapped.length !== 32) {
    throw new Error('Expected a hex string.');
  }
  return new Uint8Array(mapped);
}
