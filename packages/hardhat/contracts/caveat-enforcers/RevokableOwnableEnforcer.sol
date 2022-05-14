pragma solidity ^0.8.13;
//SPDX-License-Identifier: MIT

import "./CaveatEnforcer.sol";
import "../Delegatable.sol";

abstract contract RevokableOwnableEnforcer is CaveatEnforcer, Delegatable {

  constructor(string memory name) Delegatable(name, "1") {}

  mapping(bytes32 => bool) isRevoked;
  function enforceCaveat(
    bytes calldata terms,
    Transaction calldata transaction,
    bytes32 delegationHash
  ) public view override returns (bool) {
    require(!isRevoked[delegationHash], "Delegation has been revoked");

    // Owner methods are not delegatable in this contract:
    bytes4 targetSig = bytes4(transaction.data[0:4]);

    // transferOwnership(address newOwner)
    require(targetSig != 0xf2fde38b, "transferOwnership is not delegatable");

    // renounceOwnership() 
    require(targetSig != 0x79ba79d8, "renounceOwnership is not delegatable");

    return true;
  }

function revokeDelegation(
    SignedDelegation calldata signedDelegation,
    SignedIntentionToRevoke calldata signedIntentionToRevoke
  ) public {
    address signer = verifyDelegationSignature(signedDelegation);
    address revocationSigner = verifyIntentionToRevokeSignature(signedIntentionToRevoke);
    require(signer == revocationSigner, "Only the signer can revoke a delegation");

    bytes32 delegationHash = GET_SIGNEDDELEGATION_PACKETHASH(signedDelegation);
    isRevoked[delegationHash] = true;
  }

  function verifyIntentionToRevokeSignature(
    SignedIntentionToRevoke memory signedIntentionToRevoke
  ) public view returns (address) {
    IntentionToRevoke memory intentionToRevoke = signedIntentionToRevoke.intentionToRevoke;
    bytes32 sigHash = getIntentionToRevokeTypedDataHash(intentionToRevoke);
    address recoveredSignatureSigner = recover(sigHash, signedIntentionToRevoke.signature);
    return recoveredSignatureSigner;
  }

  function getIntentionToRevokeTypedDataHash(
    IntentionToRevoke memory intentionToRevoke
  ) public view returns (bytes32) {
    bytes32 digest = keccak256(abi.encodePacked(
      "\x19\x01",
      domainHash,
      GET_INTENTIONTOREVOKE_PACKETHASH(intentionToRevoke)
    ));
    return digest;
  }

}
