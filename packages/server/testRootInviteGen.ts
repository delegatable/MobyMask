import { Router } from "@open-rpc/server-js";
import { ethers } from "ethers";
const types = require('../react-app/src/types')
const cors = require('cors');
const createTypedMessage = require('../react-app/src/createTypedMessage');
const sigUtil = require('eth-sig-util');
const {
  TypedDataUtils,
} = sigUtil;
const {
  typedSignatureHash,
  encodeData,
} = TypedDataUtils;

const BASE_URI = 'http://localhost:3000/#';

// For reads, clients can hit the node directly.
/* so for now, we just care about this server being able to relay transactions.
  * We can add more features later, like pre-simulating txs so only process good ones.
  */

const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const contractInfo = {
  name: config.name,
  chainId: config.chainId,
  verifyingContract: config.address,
}
const deployment = require('../hardhat/deployments/localhost/PhisherRegistry.json');
console.dir(deployment);
contractInfo.verifyingContract = deployment.address;
config.address = deployment.address;
console.log('WRITING', config);
fs.writeFileSync('../react-app/src/config.json', JSON.stringify(config));

const { mnemonic } = require('./secrets.json');

const openrpcDocument = require('./openrpc.json');
const { parseOpenRPCDocument } = require("@open-rpc/schema-utils-js");
const { Server } = require("@open-rpc/server-js");
const openrpcServer = require("@open-rpc/server-js");
const { HTTPTransport, HTTPSTransport } = openrpcServer.transports;

const phisherRegistryArtifacts = require('../hardhat/artifacts/contracts/PhisherRegistry.sol/PhisherRegistry.json');
const { abi } = phisherRegistryArtifacts;


signDelegation()
  .catch(console.error);

  // TODO: Get this working without netowrk:

async function signDelegation () {

  const signer = ethers.Wallet.fromMnemonic(mnemonic);

  const invitation = {
    v:1,
    signedDelegations: [],
    key: "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  }
  console.log('A SIGNED DELEGATION/INVITE LINK:');
  console.log(JSON.stringify(invitation, null, 2));
  console.log(BASE_URI + '/members?invitation=' + encodeURIComponent(JSON.stringify(invitation)));
}

function fromHexString (hexString: string) {
  console.dir(hexString);
  if (!hexString || typeof hexString !== 'string') {
    throw new Error('Expected a hex string.');
  }
  const matched = hexString.match(/.{1,2}/g)
  if (!matched) {
    throw new Error('Expected a hex string.');
  }
  const mapped = matched.map(byte => parseInt(byte, 16));
  if (!mapped || mapped.length !== 32) {
    throw new Error('Expected a hex string.');
  }
  return new Uint8Array(mapped);
}

