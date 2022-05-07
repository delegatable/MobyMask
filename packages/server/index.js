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
var ganache = require('ganache');
var ethers = require('ethers');
var server_js_1 = require("@open-rpc/server-js");
var cors = require('cors');
var fs = require('fs');
var path = require('path');
var configPath = path.join(__dirname, './config.json');
var openrpcDocument = require('./openrpc.json');
var Server = require("@open-rpc/server-js").Server;
var _a = require("@open-rpc/server-js"), HTTPServerTransport = _a.HTTPServerTransport, HTTPSServerTransport = _a.HTTPSServerTransport;
var phisherRegistryArtifacts = require('../hardhat/artifacts/contracts/PhisherRegistry.sol/PhisherRegistry.json');
var abi = phisherRegistryArtifacts.abi;
var ganacheProvider = ganache.provider({
    database: {
        dbPath: './db'
    }
});
var provider = new ethers.providers.Web3Provider(ganacheProvider);
var signer = provider.getSigner();
var registry;
var methodHandlerMapping = {
    submitInvocations: function (signedInvocations) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, registry.invoke(signedInvocations)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    }); }
};
setupContract()
    .then(function (_registry) { return registry = _registry; })
    .then(activateServer)["catch"](console.error);
function activateServer() {
    return __awaiter(this, void 0, void 0, function () {
        var router, server, httpOptions, httpTransport;
        return __generator(this, function (_a) {
            router = new server_js_1.Router(openrpcDocument, methodHandlerMapping);
            server = new Server();
            httpOptions = {
                middleware: [cors({ origin: "*" })],
                port: 4345
            };
            httpTransport = new HTTPServerTransport(httpOptions);
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
            server.addTransports([httpTransport /*, httpsTransport */]); // will be started immediately.
            return [2 /*return*/];
        });
    });
}
function setupContract() {
    return __awaiter(this, void 0, void 0, function () {
        var config, address;
        return __generator(this, function (_a) {
            try {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                address = config.address;
                return [2 /*return*/, attachToContract(address)];
            }
            catch (err) {
                console.log('No config detected, deploying contract and creating one.');
                return [2 /*return*/, deployContract()];
            }
            return [2 /*return*/];
        });
    });
}
function deployContract() {
    return __awaiter(this, void 0, void 0, function () {
        var Registry, registry, address;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Registry = new ethers.ContractFactory(abi, phisherRegistryArtifacts.bytecode, signer);
                    return [4 /*yield*/, Registry.deploy('MobyMask')];
                case 1:
                    registry = _a.sent();
                    address = registry.address;
                    fs.writeFileSync(configPath, JSON.stringify({ address: address }, null, 2));
                    return [2 /*return*/, registry.deployed()];
            }
        });
    });
}
function attachToContract(address) {
    return __awaiter(this, void 0, void 0, function () {
        var Registry, registry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Registry = new ethers.Contract(address, abi, signer);
                    return [4 /*yield*/, Registry.attach(address)];
                case 1:
                    registry = _a.sent();
                    return [2 /*return*/, registry.deployed()];
            }
        });
    });
}
