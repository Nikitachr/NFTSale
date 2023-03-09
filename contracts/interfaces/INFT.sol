interface INFT {
    function mint(address receiver, uint256 quantity) external;
    function balanceOf(address owner) external view returns(uint256);
}