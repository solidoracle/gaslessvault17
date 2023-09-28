import { ethers } from "hardhat";

async function main() {
  const ibSquare = await ethers.getContractAt("IbSquare", "0x16d3e66A3Ee2cC303d309EA93ffaEa56c89effe5");
  const stIbSquare = "0x24CCcfACDEC2c729eE6e56B98fa63C7bd6bb0cd4";

  await ibSquare.setSuperToken(stIbSquare);
  console.log("addSupertoken: task complete");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run deploy/addSupertoken_mumbai.ts --network polygonMumbai
