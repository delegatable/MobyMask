import { ethers } from "ethers";
const types = require('./types')
const { abi } = require('./artifacts');
const { chainId, address, name } = require('./config.json');
const CONTRACT_NAME = name;

export default async function createRegistry () {
  const { key, signedDelegations } = invitation;

  const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  const wallet = web3Provider.getSigner();
  const registry = await attachRegistry(wallet);
  return registry;
}

async function attachRegistry (signer) {
  const Registry = new ethers.Contract(address, abi, signer);
  const _registry = await Registry.attach(address);
  const deployed = await _registry.deployed();
  return deployed;
}
