pragma solidity ^0.8.13;
//SPDX-License-Identifier: MIT

import "./Delegatable.sol";
import "./caveat-enforcers/RevokableOwnableDelegatable.sol";

contract PhisherRegistry is RevokableOwnableDelegatable {

  constructor(string memory name) RevokableOwnableDelegatable(name) {}

  mapping (string => bool) public isPhisher;
  event PhisherStatusUpdated(string indexed entity, bool isPhisher);
  function claimIfPhisher (string calldata identifier, bool isAccused) onlyOwner public {
    isPhisher[identifier] = isAccused;
    emit PhisherStatusUpdated(identifier, isAccused);
  }

  mapping (string => bool) public isMember;
  event MemberStatusUpdated(string indexed entity, bool isMember);
  function claimIfMember (string calldata identifier, bool isNominated) onlyOwner public {
    isMember[identifier] = isNominated;
    emit MemberStatusUpdated(identifier, isNominated);
  }

}
