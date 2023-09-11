const HDWalletProvider = require("@truffle/hdwallet-provider");
const keys = require("./keys.json");

module.exports = {
  contracts_build_directory: "./public/contracts",
  networks: {
    development: {
     host: "127.0.0.1",
     port: 7545,
     network_id: "*",
    },

    klaytn_baobap: {
      provider: () =>
        new HDWalletProvider(
          keys.PRIVATE_KEY,
          keys.BLOCKPI_BAOBAP_URL
        ),
      network_id: 1001,
      gas: 10000000,
      gasPrice: null,
      confirmations: 2,
      timeoutBlocks: 200,
    },

  },
  
  compilers: {
    solc: {
      version: "0.8.13",
    }
  },
};