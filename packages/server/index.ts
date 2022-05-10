import { Router } from "@open-rpc/server-js";
import { ethers } from "ethers";
const cors = require('cors');
const createGanacheProvider = require('./providers/ganacheProvder');

const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, './config.json');
const { mnemonic, rpcUrl } = require('./secrets.json');

const openrpcDocument = require('./openrpc.json');
const { parseOpenRPCDocument } = require("@open-rpc/schema-utils-js");
const { Server } = require("@open-rpc/server-js");
const openrpcServer = require("@open-rpc/server-js");
console.dir(openrpcServer);
const { HTTPTransport, HTTPSTransport } = openrpcServer.transports;

const phisherRegistryArtifacts = require('../hardhat/artifacts/contracts/PhisherRegistry.sol/PhisherRegistry.json');
const { abi } = phisherRegistryArtifacts;

let provider: ethers.providers.Provider;
if (process.env.ENV === 'PROD') {
  provider = new ethers.providers.JsonRpcProvider(rpcUrl);
} else {
  const ganacheProvder = createGanacheProvider(mnemonic);
  provider = new ethers.providers.Web3Provider(ganacheProvder);
}

let registry: ethers.Contract;
let signer: ethers.Wallet;

const methodMapping = {
  submitInvocations: async (signedInvocations: SignedInvocation[]): Promise<boolean> => {
    try {
      const tx = await registry.invoke(signedInvocations);
      const block = tx.block;
      console.log(block);
    } catch (err) {
      console.log('Invocation failed.', err);
      return false;
    }

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
}

async function activateServer () {
  const router = new Router(openrpcDocument, methodMapping);
  const serverOptions = {
    openrpcDocument: await parseOpenRPCDocument(openrpcDocument),
    transportConfigs: [
      {
        type: "HTTPTransport",
        options: {
          port: 3330,
          middleware: [],
        },
      },
      {
        type: "HTTPSTransport",
        options: {
          port: 3331,
          middleware: [],
        },
      },
    ],
    methodMapping,
  };
  const server = new Server(serverOptions);

  const httpOptions = {
    middleware: [ cors({ origin: "*" }) ],
    port: 4345
  };
  const httpTransport = new HTTPTransport(httpOptions);

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

  server.start();
  // server.addTransports([ httpTransport /*, httpsTransport */] ); // will be started immediately.
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
  const balance = await provider.getBalance(signer?.address && signer.address);
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
  console.log('Attaching to existing contract');
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
