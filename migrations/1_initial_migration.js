const Hackathon = artifacts.require("Hackathon");

module.exports = function (deployer) {
  deployer.deploy(Hackathon);
};