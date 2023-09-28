import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";

async function main() {
  const IbSquare = await ethers.getContractFactory("IbSquare");

  const name = "Interest Bearing Square";
  const symbol = "IbSquare";
  const usdt = "0xFCe7187B24FCDc9feFfE428Ec9977240C6F7006D"; // mock usdt on mumbai
  const supportedTokens = [usdt];
  const interestPerSecond = BigNumber.from("100000000470636740");
  const annualInterest = 500;
  const trustedForwarder = "0x69015912AA33720b842dCD6aC059Ed623F28d9f7"; // https://docs-gasless.biconomy.io/misc/contract-addresses

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

// npx hardhat run deploy/deployIbSquare_mumbai.ts --network polygonMumbai
// npx hardhat verify 0x16d3e66A3Ee2cC303d309EA93ffaEa56c89effe5 --network polygonMumbai
