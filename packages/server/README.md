# MobyMask Server

To start `npm start`

To re-deploy, `rm config.json && npm start`.

Requires a `secrets.json` with a `mnemonic` and `rpcUrl` to target.

Exposes its own JSON-RPC API, defined by `openrpc.json`.

Spins up a ganache by default, but if you set `ENV=JSON_RPC_URL` it will spin up pointing at that rpc instead.

