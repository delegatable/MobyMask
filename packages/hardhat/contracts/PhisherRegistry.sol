pragma solidity ^0.8.13;
//SPDX-License-Identifier: MIT

import "./Delegatable.sol";
import "./caveat-enforcers/AbstractRevocationEnforcer.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "hardhat/console.sol";

contract PhisherRegistry is Ownable, RevocationEnforcer {

  constructor(string memory name) RevocationEnforcer(name) {}

  mapping (string => bool) public isPhisher;
  event PhisherStatusUpdated(string indexed entity, bool isPhisher);
  function claimIfPhisher (string calldata identifier, bool isAccused) onlyOwner public {
    console.log("Claiming is Phisher %s", identifier);
    isPhisher[identifier] = isAccused;
    emit PhisherStatusUpdated(identifier, isAccused);
  }

  mapping (string => bool) public isMember;
  event MemberStatusUpdated(string indexed entity, bool isMember);
  function claimIfMember (string calldata identifier, bool isNominated) onlyOwner public {
    isMember[identifier] = isNominated;
    emit MemberStatusUpdated(identifier, isNominated);
  }

  /**
   * This is boilerplate that must be added to any Delegatable contract if it also inherits
   * from another class that also implements _msgSender().
   */
  function _msgSender () internal view override(Delegatable, Context) returns (address sender) {
    console.log("msgSender() %s vs this address %s", msg.sender, address(this));
    if(msg.sender == address(this)) {
      bytes memory array = msg.data;
      uint256 index = msg.data.length;
      console.log("Loading the crazy type of delegated msg sender");
      assembly {
        // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
        sender := and(mload(add(array, index)), 0xffffffffffffffffffffffffffffffffffffffff)
      }
    } else {
      console.log("Assigning sender as normal msg sender %s", msg.sender);
      sender = msg.sender;
    }
    return sender;
  }
}
