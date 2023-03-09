import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { beforeEach } from "mocha";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { NFT, NFT__factory, NFTSale, NFTSale__factory } from "../typechain";
import { ethers } from "hardhat";
describe("NFTSale", () => {
    let owner: SignerWithAddress;
    let alice: SignerWithAddress;

    let nft: NFT;
    let nftSale: NFTSale;

    let nft_factory: NFT__factory;
    let nftSale_factory: NFTSale__factory;

    before(async () => {
        nftSale_factory = await ethers.getContractFactory("NFTSale");
        nft_factory = await ethers.getContractFactory("NFT");
    })

    beforeEach(async () => {
        [owner, alice] = await ethers.getSigners();

        nft = await nft_factory.deploy('NFT', 'NFT', 'mock-base-uri/');
        await nft.deployed();

        nftSale = await nftSale_factory.deploy(parseEther('0.1'), 3, nft.address);
        await nftSale.deployed();

        await nft.addNFTSale(nftSale.address);
    })

    describe('function buy', () => {
        it('should revert if amount is zero', async () => {
            await expect(nftSale.buy(0)).revertedWith('[buy]: cant buy zero tokens')
        })

        it('should revert if buy limit exceeded', async () => {
            await expect(nftSale.buy(4, {value: parseEther('0.4')})).revertedWith('[buy]: buy limit exceeded')
        })

        it('should mint tokens', async () => {
            await nftSale.buy(3, {value: parseEther('0.3')});
            expect(await nft.balanceOf(owner.address)).eq(3);
        })
    })

    describe('function withdraw', () => {
        it('should withdraw', async () => {
            const prevBalance = await ethers.provider.getBalance(owner.address);
            await nftSale.connect(alice).buy(3, {value: parseEther('0.3')});
            await nftSale.withdraw();
            const currentBalance = await ethers.provider.getBalance(owner.address);
            expect(currentBalance).closeTo(prevBalance.add(parseEther('0.3')), parseEther('0.0001'))
        })
    })


})