const SaigonWallet = artifacts.require("SaigonWallet");

module.exports = function (deployer) {
  deployer.deploy(SaigonWallet);
};