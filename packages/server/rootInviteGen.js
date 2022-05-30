"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var ethers_1 = require("ethers");
var types = require('../react-app/src/types');
var cors = require('cors');
var createTypedMessage = require('../react-app/src/createTypedMessage');
var sigUtil = require('eth-sig-util');
var createMembership = require('eth-delegatable-utils').createMembership;
var TypedDataUtils = sigUtil.TypedDataUtils;
var typedSignatureHash = TypedDataUtils.typedSignatureHash, encodeData = TypedDataUtils.encodeData;
var BASE_URI = 'https://mobymask.com/#';
// For reads, clients can hit the node directly.
/* so for now, we just care about this server being able to relay transactions.
  * We can add more features later, like pre-simulating txs so only process good ones.
  */
var fs = require('fs');
var path = require('path');
var config = require('./config.json');
var contractInfo = {
    name: config.name,
    chainId: config.chainId,
    verifyingContract: config.address
};
var mnemonic = require('./secrets.json').mnemonic;
var openrpcDocument = require('./openrpc.json');
var parseOpenRPCDocument = require("@open-rpc/schema-utils-js").parseOpenRPCDocument;
var Server = require("@open-rpc/server-js").Server;
var openrpcServer = require("@open-rpc/server-js");
var _a = openrpcServer.transports, HTTPTransport = _a.HTTPTransport, HTTPSTransport = _a.HTTPSTransport;
var phisherRegistryArtifacts = require('../hardhat/artifacts/contracts/PhisherRegistry.sol/PhisherRegistry.json');
var abi = phisherRegistryArtifacts.abi;
signDelegation()["catch"](console.error);
// TODO: Get this working without netowrk:
function signDelegation() {
    return __awaiter(this, void 0, void 0, function () {
        var signer, membership, invitation;
        return __generator(this, function (_a) {
            signer = ethers_1.ethers.Wallet.fromMnemonic(mnemonic);
            membership = createMembership({
                key: signer.privateKey,
                contractInfo: contractInfo
            });
            invitation = {
                v: 1,
                signedDelegations: [],
                key: signer.privateKey
            };
            console.log('A SIGNED DELEGATION/INVITE LINK:');
            console.log(JSON.stringify(invitation, null, 2));
            console.log(BASE_URI + '/members?invitation=' + encodeURIComponent(JSON.stringify(invitation)));
            return [2 /*return*/];
        });
    });
}
function fromHexString(hexString) {
    console.dir(hexString);
    if (!hexString || typeof hexString !== 'string') {
        throw new Error('Expected a hex string.');
    }
    var matched = hexString.match(/.{1,2}/g);
    if (!matched) {
        throw new Error('Expected a hex string.');
    }
    var mapped = matched.map(function (byte) { return parseInt(byte, 16); });
    if (!mapped || mapped.length !== 32) {
        throw new Error('Expected a hex string.');
    }
    return new Uint8Array(mapped);
}
