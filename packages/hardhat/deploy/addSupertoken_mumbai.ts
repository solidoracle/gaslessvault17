import { ethers } from "hardhat";

async function main() {
  const ibSquare = await ethers.getContractAt("IbSquare", "0x6B41a8a7f6ce32366474dFe14246342d52598ab2");
  const stIbSquare = "0x99369caF089C89DAb460C5a2dfDB1b63FA45C000";

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
