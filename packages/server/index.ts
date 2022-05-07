const ganache = require('ganache');
import { Router } from "@open-rpc/server-js";
import { ethers } from "ethers";
const cors = require('cors');

const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, './config.json');
const { mnemonic } = require('./secrets.json');

const openrpcDocument = require('./openrpc.json');
const { Server } = require("@open-rpc/server-js");
const { HTTPServerTransport, HTTPSServerTransport } = require("@open-rpc/server-js");

const phisherRegistryArtifacts = require('../hardhat/artifacts/contracts/PhisherRegistry.sol/PhisherRegistry.json');
const { abi } = phisherRegistryArtifacts;

const ganacheProvider = ganache.provider({
  database: {
    dbPath: './db',
  },
  wallet: {
    mnemonic
  },
  miner: {
    blockGasLimit: '0x15f90000000000',
    defaultTransactionGasLimit: '0x15f900000000000000',
  },
  logging: {
    debug: true,
    verbose: true,
  }
});
const provider = new ethers.providers.Web3Provider(ganacheProvider);


let registry: ethers.Contract;
let signer: ethers.Wallet;
let signerAddress: string;

const methodHandlerMapping = {
  submitInvocations: async (signedInvocations: SignedInvocation[]): Promise<boolean> => {
    await registry.invoke(signedInvocations);
    return true;
  }, 
};

setupSigner()
  .then(setupContract)
  .then(_registry => registry = _registry)
  .then(activateServer)
  .catch(console.error);

async function setupSigner () {
  signer = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  console.log(`balance is ${await provider.getBalance(signer.address)}`);
}

async function activateServer () {
  const router = new Router(openrpcDocument, methodHandlerMapping);
  const server = new Server();

  const httpOptions = {
    middleware: [ cors({ origin: "*" }) ],
    port: 4345
  };
  const httpTransport = new HTTPServerTransport(httpOptions);

  /*
  const httpsOptions = { // extends https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
    middleware: [ cors({ origin: "*" }) ],
    port: 4346,
    key: await fs.readFile("test/fixtures/keys/agent2-key.pem"),
    cert: await fs.readFile("test/fixtures/keys/agent2-cert.pem"),
    ca: fs.readFileSync("ssl/ca.crt")
  };
  const httpsTransport = new HTTPSServerTransport(httpsOptions);
  */

  server.setRouter(router);
  server.addTransports([ httpTransport /*, httpsTransport */] ); // will be started immediately.
}

async function setupContract (): Promise<ethers.Contract> {
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
  console.dir(signer);
  console.log(`trying to publish with ${signer}`);
  console.dir(signer);
  const balance = await provider.getBalance(signer?.address && signer.address);
  console.log(`they have`, balance.toString())
  const registry = await Registry.deploy('MobyMask');
  const address = registry.address;
  fs.writeFileSync(configPath, JSON.stringify({ address }, null, 2));
  try {
    return await registry.deployed();
  } catch (err) {
    console.log('Deployment failed, trying to attach to existing contract.', err);
    throw err;
  }
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
