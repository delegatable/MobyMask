pragma solidity ^0.8.13;
//SPDX-License-Identifier: MIT

import "./Delegatable.sol";
import "./caveat-enforcers/RevokableOwnableDelegatable.sol";

contract ClaimRegistry is RevokableOwnableDelegatable {

  constructor(string memory name) RevokableOwnableDelegatable(name) {}

  mapping (string => mapping (bytes32 => bool)) public boolClaims;
  function makeBooleanClaim (string calldata identifier, bytes32 claimType, bool isClaimed) onlyOwner public {
    boolClaims[identifier][claimType] = isClaimed;
  }

  mapping (string => mapping (bytes32 => string)) public claims;
  function makeClaim (string calldata identifier, bytes32 claimType, string calldata claim) onlyOwner public {
    claims[identifier][claimType] = claim;
  }

}
