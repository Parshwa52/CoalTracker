const CoalTracker = artifacts.require("CoalTracker");

module.exports = function(deployer) {
  deployer.deploy(CoalTracker);
};
