import { ethers } from "ethers";
const { abi } = require('./artifacts');
const { address, name } = require('./config.json');
const CONTRACT_NAME = name;

export default async function createRegistry (provider) {
  console.log('creating registry');
  console.log('made provider')
  const wallet = provider.getSigner();
  console.log('made wallet, attaching registry', wallet);
  const registry = await attachRegistry(wallet);
  console.log('there it is', registry);
  return registry;
}

async function attachRegistry (signer) {
  const Registry = new ethers.Contract(address, abi, signer);
  const _registry = await Registry.attach(address);
  const deployed = await _registry.deployed();
  return deployed;
}
