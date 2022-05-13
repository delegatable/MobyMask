const { expect } = require("chai");
const { ethers } = require("hardhat");
const friendlyTypes = require('../types');
const BigNumber = ethers.BigNumber;
const { generateUtil } = require('eth-delegatable-utils');
const createTypedMessage = require('../scripts/createTypedMessage');
const sigUtil = require('eth-sig-util');
const {
  TypedDataUtils,
} = sigUtil;
const {
  typedSignatureHash,
  encodeData,
} = TypedDataUtils;
const { encode } = require("punycode");
const { TIMEOUT } = require("dns");

const types = signTypedDataify(friendlyTypes);
const CONTRACT_NAME = 'PhisherRegistry';
const ownerHexPrivateKey = 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const account1PrivKey = '59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const account2PrivKey = '5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';

describe(CONTRACT_NAME, function () {

  it('claimIfPhisher reports phisher', async () => {
    const targetString = 'PhisherGuy55'
    const yourContract = await deployContract();
    const mined = await yourContract.claimIfPhisher(targetString, true);

    expect(await yourContract.isPhisher(targetString)).to.equal(true);
  });

  it('other accounts cannot set purpose', async () => {
    const [_owner, addr1] = await ethers.getSigners();
    const targetString = 'A totally BAD purpose!'
    const yourContract = await deployContract();
    try {
      await yourContract.connect(addr1).claimIfPhisher(targetString, true);
    } catch (err) {
      expect(err.message).to.include('Ownable: caller is not the owner');
    }
  });

  it('can sign a delegation to a second account', async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    console.log(`owner: ${owner.address}`);
    console.log(`addr1: ${addr1.address}`);
    console.log(`addr2: ${addr2.address}`);

    const targetString = 'A totally DELEGATED purpose!'
    const yourContract = await deployContract();
    const { chainId } = await yourContract.provider.getNetwork();
    const utilOpts = {
      chainId,
      verifyingContract: yourContract.address,
      name: CONTRACT_NAME,      
    }
    const util = generateUtil(utilOpts);

    // Prepare the delegation message:
    // This message has no caveats, and authority 0,
    // so it is a simple delegation to addr1 with no restrictions,
    // and will allow the delegate to perform any action the signer could perform on this contract.
    const delegation = {
      delegate: addr1.address,
      authority: '0x0000000000000000000000000000000000000000000000000000000000000000',
      caveats: [],
    };
    const signedDelegation = util.signDelegation(delegation, ownerHexPrivateKey);

    // Delegate signs the invocation message:
    const desiredTx = await yourContract.populateTransaction.claimIfPhisher(targetString, true);
    const delegatePrivateKey = fromHexString(account1PrivKey);
    const invocationMessage = {
      replayProtection: {
        nonce: '0x01',
        queue: '0x00',
      },
      batch: [{
        authority: [signedDelegation],
        transaction: {
          to: yourContract.address,
          gasLimit: '10000000000000000',
          data: desiredTx.data,
        },
      }],
    };
    const signedInvocation= util.signInvocation(invocationMessage, account1PrivKey);

    // A third party can submit the invocation method to the chain:
    const res = await yourContract.connect(addr2).invoke([signedInvocation]);

    // Verify the change was made:
    expect(await yourContract.connect(addr2).isPhisher(targetString)).to.equal(true);
  })

  it('delegates can delegate', async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    console.log(`owner: ${owner.address}`);
    console.log(`addr1: ${addr1.address}`);
    console.log(`addr2: ${addr2.address}`);

    const targetString = 'A totally DELEGATED purpose!'
    const yourContract = await deployContract();
    const { chainId } = await yourContract.provider.getNetwork();
    const utilOpts = {
      chainId,
      verifyingContract: yourContract.address,
      name: CONTRACT_NAME,      
    }
    const util = generateUtil(utilOpts);

    // Prepare the delegation message:
    // This message has no caveats, and authority 0,
    // so it is a simple delegation to addr1 with no restrictions,
    // and will allow the delegate to perform any action the signer could perform on this contract.
    const delegation = {
      delegate: addr1.address,
      authority: '0x0000000000000000000000000000000000000000000000000000000000000000',
      caveats: [],
    };
    const signedDelegation = util.signDelegation(delegation, ownerHexPrivateKey);

    const delegationHash = TypedDataUtils.hashStruct('SignedDelegation', signedDelegation, types, true);
    const delegation2 = {
      delegate: addr2.address,
      authority: delegationHash,
      caveats: [],
    };
    const signedDelegation2 = util.signDelegation(delegation2, account1PrivKey);

    // Delegate signs the invocation message:
    const desiredTx = await yourContract.populateTransaction.claimIfPhisher(targetString, true);
    const invocationMessage = {
      replayProtection: {
        nonce: '0x01',
        queue: '0x00',
      },
      batch: [{
        authority: [signedDelegation, signedDelegation2],
        transaction: {
          to: yourContract.address,
          gasLimit: '10000000000000000',
          data: desiredTx.data,
        },
      }],
    };
    const signedInvocation= util.signInvocation(invocationMessage, account2PrivKey);

    // A third party can submit the invocation method to the chain:
    const res = await yourContract.connect(addr2).invoke([signedInvocation]);

    // Verify the change was made:
    expect(await yourContract.connect(addr2).isPhisher(targetString)).to.equal(true);
  });

  it('Revocation is available as a built-in caveat', async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
    console.log(`owner: ${owner.address}`);
    console.log(`addr1: ${addr1.address}`);
    console.log(`addr2: ${addr2.address}`);

    const targetString = 'A totally DELEGATED purpose!'
    const yourContract = await deployContract();
    const { chainId } = await yourContract.provider.getNetwork();
    const utilOpts = {
      chainId,
      verifyingContract: yourContract.address,
      name: CONTRACT_NAME,      
    }
    const util = generateUtil(utilOpts);

    // Prepare the delegation message:
    // This message has no caveats, and authority 0,
    // so it is a simple delegation to addr1 with no restrictions,
    // and will allow the delegate to perform any action the signer could perform on this contract.
    const delegation = {
      delegate: addr1.address,
      authority: '0x0000000000000000000000000000000000000000000000000000000000000000',
      caveats: [{
        enforcer: yourContract.address,
        terms: '0x0000000000000000000000000000000000000000000000000000000000000000',
      }],
    };
    const signedDelegation = util.signDelegation(delegation, ownerHexPrivateKey);

    // Owner revokes outstanding delegation
    await yourContract.revokeDelegation(signedDelegation);

    // Delegate signs the invocation message:
    const desiredTx = await yourContract.populateTransaction.claimIfPhisher(targetString, true);
    const delegatePrivateKey = fromHexString(account1PrivKey);
    const invocationMessage = {
      replayProtection: {
        nonce: '0x01',
        queue: '0x00',
      },
      batch: [{
        authority: [signedDelegation],
        transaction: {
          to: yourContract.address,
          gasLimit: '10000000000000000',
          data: desiredTx.data,
        },
      }],
    };
    const signedInvocation= util.signInvocation(invocationMessage, account1PrivKey);

    try {
      // A third party can submit the invocation method to the chain:
      const res = await yourContract.connect(addr2).invoke([signedInvocation]);
    } catch (err) {
      // Should not be permitted:
      expect(err.message).to.include('Delegation has been revoked');
    }
  });

});

async function deployContract () {
  const YourContract = await ethers.getContractFactory(CONTRACT_NAME);
  const yourContract = await YourContract.deploy(CONTRACT_NAME);
  return yourContract.deployed();
}

function fromHexString (hexString) {
  return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

function signTypedDataify (friendlyTypes) {
  const types = {};
  Object.keys(friendlyTypes).forEach(typeName => {
    const type = friendlyTypes[typeName];
    types[typeName] = [];

    Object.keys(friendlyTypes[typeName]).forEach(subTypeName => {

      const subType = friendlyTypes[typeName][subTypeName];
      types[typeName].push({
        name: subTypeName,
        type: subType,
      });
    });
  });
  return types;
}
