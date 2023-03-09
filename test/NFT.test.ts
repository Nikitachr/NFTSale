import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { beforeEach } from "mocha";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { NFT, NFT__factory, NFTSale, NFTSale__factory } from "../typechain";
import { ethers } from "hardhat";
describe("NFT", () => {
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

    const accessError = (caller: string, role: string) => `AccessControl: account ${caller.toLowerCase()} is missing role ${role}`;

    describe('function addNFTSale', () => {
        it('should revert if caller is not owner', async () => {
            await expect(nft.connect(alice).addNFTSale(nftSale.address))
                .revertedWith(accessError(alice.address, ethers.constants.HashZero));
        })

        it('should add nft sale', async () => {
            await nft.addNFTSale(nftSale.address);
            expect(await nft.hasRole(await nft.NFT_SALE_ROLE(), nftSale.address)).eq(true)
        })
    })

    describe('function mint', () => {
        it('should revert if caller is not nft sale contract', async () => {
            await expect(nft.mint(alice.address, 2))
                .revertedWith(accessError(owner.address, await nft.NFT_SALE_ROLE()));
        })

        it('should mint', async () => {
            await nftSale.buy(3, {value: parseEther('0.3')})
            expect(await nft.balanceOf(owner.address)).eq(3)
        })
    })

    describe('function reveal', () => {
        it('should revert if caller is not owner', async () => {
            await expect(nft.connect(alice).reveal())
                .revertedWith(accessError(alice.address, ethers.constants.HashZero));
        })

        it('should reveal base uri', async () => {
            await nftSale.buy(1, {value: parseEther('0.1')})
            expect(await nft.tokenURI(0)).eq('mock-base-uri/unrevealed.json')
            await nft.reveal();
            expect(await nft.tokenURI(0)).eq('mock-base-uri/0.json')
        })
    })

})