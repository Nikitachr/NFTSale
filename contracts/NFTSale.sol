// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/INFT.sol";

contract NFTSale is Ownable {

    uint256 immutable public price;
    uint256 immutable public maxTokensPerUser;

    INFT public immutable nft;

    constructor(uint256 _price, uint256 _maxTokensPerUser, INFT _nft) {
        price = _price;
        maxTokensPerUser = _maxTokensPerUser;
        nft = _nft;
    }

    function buy(uint256 amount) external payable {
        address sender = msg.sender;

        require(amount > 0, "[buy]: cant buy zero tokens");
        require(msg.value >= price * amount, "[buy]: insufficient funds");
        require(nft.balanceOf(sender) + amount <= maxTokensPerUser, "[buy]: buy limit exceeded");

        nft.mint(sender, amount);
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

}
