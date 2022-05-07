const ganache = require('ganache');
const ethers = require('ethers');
import { Router } from "@open-rpc/server-js";

const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, './config.json');

const openrpcDocument = require('./openrpc.json');
const { Server } = require("@open-rpc/server-js");
const { HTTPServerTransport, HTTPSServerTransport } = require("@open-rpc/server-js");

const phisherRegistryArtifacts = require('../hardhat/artifacts/contracts/PhisherRegistry.sol/PhisherRegistry.json');
const { abi } = phisherRegistryArtifacts;

const ganacheProvider = ganache.provider({
  database: {
    dbPath: './db',
  }
});
const provider = new ethers.providers.Web3Provider(ganacheProvider);
const signer = provider.getSigner();

let registry;

const methodHandlerMapping = {
  submitInvocations: async (signedInvocations: SignedInvocation[]): Promise<boolean> => {
    await registry.invoke(signedInvocations);
    return true;
  }, 
};

setupContract()
  .then(_registry => registry = _registry)
  .then(activateServer)
  .catch(console.error);

async function activateServer () {
  const router = new Router(openrpcDocument, methodHandlerMapping);
  const server = new Server();
  server.start();

  server.addTransport(HTTPSServerTransport); // will be started immediately
  server.setRouter(router);
  server.addTransports([ HTTPSServerTransport, HTTPServerTransport] ); // will be started immediately.
}

async function setupContract () {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const { address } = config;
    return attachToContract(address)
  } catch (err) {
    console.log('No config detected, deploying contract and creating one.');
    return deployContract()
  }
}

async function deployContract () {
  const Registry = new ethers.ContractFactory(abi, phisherRegistryArtifacts.bytecode, signer);
  const registry = await Registry.deploy('MobyMask');
  const address = registry.address;
  fs.writeFileSync(configPath, JSON.stringify({ address }, null, 2));
  return registry.deployed();
}

async function attachToContract(address: string) {
  const Registry = new ethers.Contract(address, abi, signer);
  const registry = await Registry.attach(address);
  return registry.deployed();
}

type Invocation = {
  transaction: Transaction,
  authority: SignedDelegation[],
};

type Transaction = {
  to: string,
  gasLimit: string,
  data: string,
};

type SignedDelegation = {
  delegation: Delegation,
  signature: string,
}

type Delegation = {
  delegate: string,
  authority: string,
  caveats: Caveat[],
};

type Caveat = {
  enforcer: string,
  terms: string,
}

type SignedInvocation = {
  invocation: Invocation,
  signature: string,
}
