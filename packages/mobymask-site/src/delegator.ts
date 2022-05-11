import { ethers } from "ethers";
const types = require('./types')
const createTypedMessage = require('./createTypedMessage');
const sigUtil = require('eth-sig-util');
const {
  TypedDataUtils,
} = sigUtil;
const {
  typedSignatureHash,
  encodeData,
  recoverTypedSignature,
} = TypedDataUtils;
const CONTRACT_NAME = 'PhisherRegistry';

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

export async function validateInvitation (invitation: Invitation): Promise<boolean> {

  const { signedDelegations, key } = invitation;

  for (let i = 0; i < signedDelegations.length; i++) {
    const signedDelegation = signedDelegations[i];
    const typedMessage = { ...types, data: signedDelegation };

    const signer = recoverTypedSignature({
      data: typedMessage,
      signature: signedDelegation.signature,
      version: 'V4',
    });
  }

  return !!invitation;
}
