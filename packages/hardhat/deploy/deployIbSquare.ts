import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";

async function main() {
  const IbSquare = await ethers.getContractFactory("IbSquare");

  const name = "Interest Bearing Square";
  const symbol = "IbSquare";
  const weth = "0xCCB14936C2E000ED8393A571D15A2672537838Ad";
  const supportedTokens = [weth];
  const interestPerSecond = BigNumber.from("100000000470636740");
  const annualInterest = 500;
  const trustedForwarder = "0xE041608922d06a4F26C0d4c27d8bCD01daf1f792"; // https://docs-gasless.biconomy.io/misc/contract-addresses

  const ibSquare = await upgrades.deployProxy(
    IbSquare,
    [name, symbol, supportedTokens, trustedForwarder, interestPerSecond, annualInterest],
    {
      initializer: "initialize",
      unsafeAllow: ["delegatecall"],
      kind: "uups",
    },
  );

  console.log("IbSquare upgradable deployed to:", ibSquare.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run deploy/deployIbSquare.ts --network goerli
// npx hardhat verify 0xBb0183abEDAaEf8CEe584B80844c87A20F3dE907 --network goerli
