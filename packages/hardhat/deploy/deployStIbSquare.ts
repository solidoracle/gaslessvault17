import { ethers, upgrades } from "hardhat";

async function main() {
  const StIbSquare = await ethers.getContractFactory("StIbSquare");

  const ibSquare = "0xBb0183abEDAaEf8CEe584B80844c87A20F3dE907";
  const name = "Streaming IbSquare";
  const symbol = "StIbSquare";
  const superfluidHost = "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9";

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

// npx hardhat run deploy/deployStIbSquare.ts --network goerli
// npx hardhat verify 0x --network polygon
