// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

contract CryptoDevToken is ERC20, Ownable{
    ICryptoDevs CryptoDevsNFT;
    uint256 public constant tokenPrice = 0.001 ether;
    uint256 public constant maxTotalSupply = 10000 * 10**18;
    uint256 public constant tokensPerNFT = 10 * 10**18;
// 10^(--> **)18 means 1 NFT so if you want 10 NFT then write 10*(10^18)

    mapping(uint256 => bool) public tokenIsClaimed;
constructor(address _cryptoDevsContract) ERC20("Crypto Devs Token","CD"){
 CryptoDevsNFT = ICryptoDevs(_cryptoDevsContract);
}
function mint(uint256 amount) public payable{
    uint256 _requiredAmount = tokenPrice * amount;
    require(msg.value >= _requiredAmount,"Ether sent is incorrect");
    uint256 amountWithDecimals = amount * 10**18;
    require(totalSupply() + amountWithDecimals <= maxTotalSupply, "Exceeds the max total supply available");
    _mint(msg.sender, amountWithDecimals);
}
function claim() public {
    address sender = msg.sender;
    uint256 balance = CryptoDevsNFT.balanceOf(sender);
    //balance -> No of NFT that address have.
    require(balance > 0,"You don't own any Crypto Dev NFTs");
    uint256 amount = 0;
    for(uint256 i = 0; i < balance; i++){
        uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(sender, i);
        if(!tokenIsClaimed[tokenId]){
            amount += 1;
            tokenIsClaimed[tokenId] = true;
        }
    }
    require(amount > 0, "You have already claimed all your tokens");
    _mint(msg.sender, amount * tokensPerNFT);
} 
  receive() external payable{}
  fallback() external payable{}
}