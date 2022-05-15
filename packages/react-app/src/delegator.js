import { ethers } from "ethers";
const types = require('./types')
const delegationUtils = require('eth-delegatable-utils');
const { recoverDelegationSigner } = delegationUtils;
const createTypedMessage = require('./createTypedMessage');
const sigUtil = require('@metamask/eth-sig-util');
const { chainId, address, name } = require('./config.json');
const { abi } = require('./artifacts');
const CONTRACT_NAME = name;

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

export async function validateInvitation (invitation) {
  console.log('invitation', invitation);

  const { signedDelegations, key } = invitation;
  const wallet = new ethers.Wallet(key);

  for (let i = 0; i < signedDelegations.length; i++) {
    console.log('delegation ' + i);
    const signedDelegation = signedDelegations[i];
    const signer = recoverDelegationSigner(signedDelegation, {
      chainId,
      verifyingContract: address,
      name: CONTRACT_NAME,
    });
    console.log('signed by ', signer);
    console.log('delegating to ', signedDelegation.delegation.delegate);

    if (i === 0) {
      if (signer !== '0xDdb18b319BE3530560eECFF962032dFAD88212d4'.toLowerCase()) {
        throw new Error('invalid signer' + signer + ' instead of '+ '0xDdb18b319BE3530560eECFF962032dFAD88212d4'.toLowerCase());
      }
    } else if (signer.toLowerCase() !== delegate) {
      throw new Error('Invalid invitation chain');
    }

    const delegate = signedDelegations[signedDelegations.length - 1].delegation.delegate.toLowerCase();
    if (wallet.address.toLowerCase() !== delegate.toLowerCase()) {
      throw new Error ('Invalid invitation, delegate does not match provided key.');
    }

  }

  return !!invitation;
}
