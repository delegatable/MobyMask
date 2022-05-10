const ganache = require('ganache');

module.exports = function createGanacheProvider (mnemonic: string) {
  return ganache.provider({
    database: {
      dbPath: './db',
    },
    wallet: {
      mnemonic,
      defaultBalance: '100000'
    },
    miner: {
      blockGasLimit: '0x15f90000000000',
      defaultTransactionGasLimit: '0x15f900000000000000',
    },
    logging: {
      debug: false,
      verbose: false,
    },
    chain: {
      chainId: '3469',
      networkId: '3469',
    }
  });
}
