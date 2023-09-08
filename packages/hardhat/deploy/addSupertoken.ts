import { ethers } from "hardhat";

async function main() {
  const ibSquare = await ethers.getContractAt("IbSquare", "0xbb0183abedaaef8cee584b80844c87a20f3de907");
  const stIbSquare = "0xc9CC6fB607F3bDF3d54bD2b75F3Dbf727990f882";

  await ibSquare.setSuperToken(stIbSquare);
  console.log("addSupertoken: task complete");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run deploy/addSupertoken.ts --network goerli
