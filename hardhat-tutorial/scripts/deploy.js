// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const {CRYPTO_DEVS_NFT_CONTRACT_ADDRESS} = require("../constants")
async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;


  const cryptoDevTokenContract  = await hre.ethers.getContractFactory("CryptoDevToken");
  const cryptoDev = await cryptoDevTokenContract.deploy(CRYPTO_DEVS_NFT_CONTRACT_ADDRESS);

  await cryptoDev.deployed();

  console.log(
    `CryptoDev deployed to ${cryptoDev.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
