import { parseEther } from "ethers/lib/utils";
import { ethers, run } from "hardhat";

async function main() {
  const nftSale_factory = await ethers.getContractFactory("NFTSale");
  const nft_factory = await ethers.getContractFactory("NFT");

  const nft = await nft_factory.deploy('NFT', 'NFT', 'mock-base-uri/');
  await nft.deployed();

  const nftSale = await nftSale_factory.deploy(parseEther('0.1'), 3, nft.address);
  await nftSale.deployed();

  await (await nft.addNFTSale(nftSale.address)).wait();

  console.log('NFT: ', nft.address);
  console.log('NFTSale: ', nftSale.address);

  await run("verify:verify", {
    address: nft.address,
    constructorArguments: ['NFT', 'NFT', 'mock-base-uri/'],
  });

  await run("verify:verify", {
    address: nftSale.address,
    constructorArguments: [parseEther('0.1'), 3, nft.address],
  });
}

// NFT:  0xeaB4dc288747F10E4d5D34Fc3c1e720ec6959491
// NFTSale:  0xa37E9E4e324A6449b4bfAaa544Ccd9F733DabAb2

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
