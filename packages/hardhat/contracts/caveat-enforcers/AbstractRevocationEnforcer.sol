pragma solidity ^0.8.13;
//SPDX-License-Identifier: MIT

import "./CaveatEnforcer.sol";
import "../Delegatable.sol";

abstract contract RevocationEnforcer is CaveatEnforcer, Delegatable {

  constructor(string memory name) Delegatable(name, "1") {}

  mapping(bytes32 => bool) isRevoked;
  function enforceCaveat(
    bytes calldata terms,
    Transaction calldata transaction,
    bytes32 delegationHash
  ) public override returns (bool) {
    require(!isRevoked[delegationHash], "Delegation has been revoked");
    return true;
  }

  function revokeDelegation(SignedDelegation calldata signedDelegation) public {
    address signer = verifyDelegationSignature(signedDelegation);
    address sender = _msgSender();
    require(signer == sender, "Only the signer can revoke a delegation");
    bytes32 delegationHash = GET_SIGNEDDELEGATION_PACKETHASH(signedDelegation);
    isRevoked[delegationHash] = true;
  }

}
