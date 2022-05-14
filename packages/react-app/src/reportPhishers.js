import { ethers } from "ethers";
const types = require('./types')
const { generateUtil } = require('eth-delegatable-utils');
const { abi } = require('./artifacts');
const { chainId, address, name } = require('./config.json');
const CONTRACT_NAME = name;

export default async function reportPhishers (phishers, provider, invitation) {
  const { key, signedDelegations } = invitation;
  const util = generateUtil({
    chainId,
    verifyingContract: address,
    name: CONTRACT_NAME,
  })

  const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  const wallet = web3Provider.getSigner();
  const registry = await attachRegistry(wallet);

  const invocations = await Promise.all(phishers.map(async (phisher) => {
    const _phisher = phisher.indexOf('@') === '0' ? phisher.slice(1) : phisher;
    const desiredTx = await registry.populateTransaction.claimIfPhisher(`TWT:${_phisher.toLowerCase()}`, true);
    console.log('desired tx', desiredTx);
    const invocation = {
      transaction: {
        to: address,
        data: desiredTx.data,
        gasLimit: 500000,
      },
      authority: signedDelegations,
   }
   return invocation;
  }));

  const queue = Math.floor(Math.random() * 100000000);
  console.log('queue', queue);
  const signedInvocations = util.signInvocation({
    batch: invocations,
    replayProtection: {
      nonce: 1,
      queue,
    }
  }, key);
  console.log('signedInvocations ready to invoke', signedInvocations)

  return await registry.invoke([signedInvocations]);
}

async function attachRegistry (signer) {
  const Registry = new ethers.Contract(address, abi, signer);
  const _registry = await Registry.attach(address);
  console.log('Attaching to existing contract', _registry);
  const deployed = await _registry.deployed();
  return deployed;
}
