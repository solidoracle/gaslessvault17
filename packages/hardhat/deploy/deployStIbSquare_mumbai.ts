import { ethers, upgrades } from "hardhat";

async function main() {
  const StIbSquare = await ethers.getContractFactory("StIbSquare");

  const ibSquare = "0x6B41a8a7f6ce32366474dFe14246342d52598ab2";
  const name = "Streaming IbSquare";
  const symbol = "StIbSquare";
  const superfluidHost = "0xEB796bdb90fFA0f28255275e16936D25d3418603";

  const stIbSquare = await upgrades.deployProxy(StIbSquare, [ibSquare, 18, name, symbol, superfluidHost, [ibSquare]], {
    initializer: "squareInitialize",
    unsafeAllow: ["delegatecall"],
    kind: "uups",
  });

  console.log("StIbSquare upgradable deployed to:", stIbSquare.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run deploy/deployStIbSquare_mumbai.ts --network polygonMumbai
// npx hardhat verify 0x24CCcfACDEC2c729eE6e56B98fa63C7bd6bb0cd4 --network polygonMumbai
