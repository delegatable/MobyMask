const { ethers } = require("ethers");
const types = require('./types')
const createTypedMessage = require('./createTypedMessage');
const sigUtil = require('@metamask/eth-sig-util');
const { chainId, address } = require('./config.json');
const { abi } = require('./artifacts');
const CONTRACT_NAME = 'PhisherRegistry';
const { recoverSigner } = require('./validator');

types.domain.chainId = chainId;
types.domain.verifyingContract = address;

/*
type SignedDelegation = {
  delegation: Delegation,
  signature: string,
}

type Delegation = {
  delegate: string,
  authority: string,
  caveats: Caveat[],
}

type Caveat = {
  enforcer: string,
  terms: string,
}

type Invitation = {
  signedDelegations: SignedDelegation[],
  key: string,
}
*/
exports.recoverSigner = recoverSigner;
exports.validateInvitation = async function validateInvitation (invitation, provider) {

  const { chainId } = await provider.getNetwork();
  const { signedDelegations, key } = invitation;
  const wallet = new ethers.Wallet(key, provider);
  const registry = await attachRegistry(wallet);

  for (let i = 0; i < signedDelegations.length; i++) {
    const signedDelegation = signedDelegations[i];

    const signer = recoverSigner(signedDelegations, {
      chainId,
      verifyingContract: address,
      name: CONTRACT_NAME,
    });

    const typedMessage = createTypedMessage(registry, signedDelegation.delegation, 'Delegation', CONTRACT_NAME, chainId);

    console.log('submitting typed message as data', typedMessage);

    const signer = sigUtil.recoverTypedSignature({
      data: typedMessage.data,
      signature: signedDelegation.signature,
      version: 'V4',
    });
    console.log('recovered signer', signer);

    const delegate = signedDelegations[signedDelegations.length - 1].delegation.delegate;
    if (wallet.address.toLowerCase() !== delegate.toLowerCase()) {
      throw new Error ('Invalid invitation, delegate does not match provided key.');
    }

    if (signer !== '0xDdb18b319BE3530560eECFF962032dFAD88212d4'.toLowerCase()) {
      throw new Error('invalid signer' + signer + ' instead of '+ '0xDdb18b319BE3530560eECFF962032dFAD88212d4'.toLowerCase());
    }

  }

  console.log('All is well! Invitation is valid.');
  return !!invitation;
}

async function attachRegistry (signer) {
  const Registry = new ethers.Contract(address, abi, signer);
  const _registry = await Registry.attach(address);
  console.log('Attaching to existing contract', _registry);
  const deployed = await _registry.deployed();
  return deployed;
}
