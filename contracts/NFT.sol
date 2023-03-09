// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "erc721a/contracts/extensions/ERC721ABurnable.sol";
import "erc721a/contracts/ERC721A.sol";

contract NFT is ERC721A, AccessControl {

    string private baseURI;

    bytes32 constant public NFT_SALE_ROLE = keccak256("NFT_SALE_ROLE");
    bool public revealed;

    constructor(string memory _name, string memory _symbol, string memory _baseURI) ERC721A(_name, _symbol){
        baseURI = _baseURI;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addNFTSale(address nftSale) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(NFT_SALE_ROLE, nftSale);
    }

    function mint(address receiver, uint256 quantity) external onlyRole(NFT_SALE_ROLE) {
        _mint(receiver, quantity);
    }

    function reveal() external onlyRole(DEFAULT_ADMIN_ROLE) {
        revealed = true;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();

        string memory baseURI = _baseURI();
        string memory metadataPointerId = !revealed ? 'unrevealed' : _toString(tokenId);
        string memory result = string(abi.encodePacked(baseURI, metadataPointerId, '.json'));

        return bytes(baseURI).length != 0 ? result : '';
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721A, AccessControl) returns (bool) {
        return (ERC721A.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId));
    }

}
