pragma solidity ^0.8.13;
//SPDX-License-Identifier: MIT

import "./CaveatEnforcer.sol";
import "../Delegatable.sol";

abstract contract RevocationEnforcer is CaveatEnforcer, Delegatable {

  mapping(bytes32 => bool) isRevoked;
  function enforceCaveat(
    bytes calldata terms,
    Transaction calldata transaction,
    bytes32 delegationHash
  ) public override returns (bool) {
    require(!isRevoked[delegationHash], "Delegation has been revoked");
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

  /**
   * This is boilerplate that must be added to any Delegatable contract if it also inherits
   * from another class that also implements _msgSender().
   */
  function _msgSender () internal view override(Delegatable) returns (address sender) {
    if(msg.sender == address(this)) {
      bytes memory array = msg.data;
      uint256 index = msg.data.length;
      assembly {
        // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
        sender := and(mload(add(array, index)), 0xffffffffffffffffffffffffffffffffffffffff)
      }
    } else {
      sender = msg.sender;
    }
    return sender;
  }
}
