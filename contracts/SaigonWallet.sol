// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract BonsaiCertification {
  address public owner;
  uint public bonsaiIndex = 0;
  uint[] public allCertificatedBonsais;

  mapping(uint => address) public bonsaiIdxToOwnerAddress;
  mapping(address => uint[]) public ownerAddressToBonsaiList;

  constructor(uint initialBonsaiIndex) {
    owner = msg.sender;
    bonsaiIndex = initialBonsaiIndex;
  }

  function addBonsai() public {
    require(msg.sender == owner, "Only a contract owner can add a new bonsai!");
    bonsaiIndex++;
  }

  function adoptBonsai(uint adoptIdx) public {
    require(adoptIdx < bonsaiIndex, "Bonsai index out of bounds!");
    require(bonsaiIdxToOwnerAddress[adoptIdx] == address(0), "Bonsai is already certificated");

    bonsaiIdxToOwnerAddress[adoptIdx] = msg.sender;
    ownerAddressToBonsaiList[msg.sender].push(adoptIdx);
    allCertificatedBonsais.push(adoptIdx);
  }

  function getOwner() public view returns(address) {
    return owner;
  }

  function getAllCertificatedBonsaisByOnwer() public view returns(uint[] memory) {
    return ownerAddressToBonsaiList[msg.sender];
  }

  function getAllCertificatedBonsais() public view returns(uint[] memory) {
    return allCertificatedBonsais;
  }
  
}

contract BonsaiToken {
    string public name;
    string public symbol;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public depositOf;

    event Transfer(address _from, address _to, uint256 _value);
    event Approve(address, address, uint256);

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        balanceOf[msg.sender] = _initialSupply;
        totalSupply += _initialSupply;
    }

    function deposit() public payable {
        depositOf[msg.sender] = msg.value;
        // 0.1 eth 1000 token
        uint256 totalTokenRecieve = (msg.value * 1000) / (0.1 * 10**18);
        balanceOf[msg.sender] = totalTokenRecieve;
        totalSupply += totalTokenRecieve;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(_to != address(0), "address 0 recipient");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approve(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }
}

contract SaigonWallet is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;

  struct BonsaiRwa {
    uint bonsaiId;
    uint price;
    address creator;
    bool isListed;
  }

  uint public listingPrice = 0.0016 ether;

  Counters.Counter private _listedItems;
  Counters.Counter private _bonsaiIds;

  mapping(string => bool) private _usedTokenURIs;
  mapping(uint => BonsaiRwa) private _idToBonsaiRwa;

  mapping(address => mapping(uint => uint)) private _ownedTokens;
  mapping(uint => uint) private _idToOwnedIndex;

  uint256[] private _allNfts;
  mapping(uint => uint) private _idToNftIndex;

  event BonsaiRwaCreated (
    uint bonsaiId,
    uint price,
    address creator,
    bool isListed
  );

  constructor() ERC721("SaigonWallet", "SGW") {}

  function setListingPrice(uint newPrice) external onlyOwner {
    require(newPrice > 0, "Price must be at least 1 wei");
    listingPrice = newPrice;
  }


  function getBonsaiRwa(uint bonsaiId) public view returns (BonsaiRwa memory) {
    return _idToBonsaiRwa[bonsaiId];
  }

  function listedItemsCount() public view returns (uint) {
    return _listedItems.current();
  }

  function rWAssetURIExists(string memory tokenURI) public view returns (bool) {
    return _usedTokenURIs[tokenURI] == true;
  }

  function totalSupply() public view returns (uint) {
    return _allNfts.length;
  }

  function rWAssetByIndex(uint index) public view returns (uint) {
    require(index < totalSupply(), "Index out of bounds");
    return _allNfts[index];
  }

  function rWAssetOfOwnerByIndex(address owner, uint index) public view returns (uint) {
    require(index < ERC721.balanceOf(owner), "Index out of bounds");
    return _ownedTokens[owner][index];
  }

  function getAllNftsOnSale() public view returns (BonsaiRwa[] memory) {
    uint allItemsCounts = totalSupply();
    uint currentIndex = 0;
    BonsaiRwa[] memory items = new BonsaiRwa[](_listedItems.current());

    for (uint i = 0; i < allItemsCounts; i++) {
      uint bonsaiId = rWAssetByIndex(i);
      BonsaiRwa storage item = _idToBonsaiRwa[bonsaiId];

      if (item.isListed == true) {
        items[currentIndex] = item;
        currentIndex += 1;
      }
    }

    return items;
  }

  function getOwnedNfts() public view returns (BonsaiRwa[] memory) {
    uint ownedItemsCount = ERC721.balanceOf(msg.sender);
    BonsaiRwa[] memory items = new BonsaiRwa[](ownedItemsCount);

    for (uint i = 0; i < ownedItemsCount; i++) {
      uint bonsaiId = rWAssetOfOwnerByIndex(msg.sender, i);
      BonsaiRwa storage item = _idToBonsaiRwa[bonsaiId];
      items[i] = item;
    }

    return items;
  }

  function mintRWAsset(string memory tokenURI, uint price) public payable returns (uint) {
    require(!rWAssetURIExists(tokenURI), "RWAsset URI already exists");
    require(msg.value == listingPrice, "Price must be equal to listing price");

    _bonsaiIds.increment();
    _listedItems.increment();

    uint newBonsaiId = _bonsaiIds.current();

    _safeMint(msg.sender, newBonsaiId);
    _setTokenURI(newBonsaiId, tokenURI);
    _createBonsaiRwa(newBonsaiId, price);
    _usedTokenURIs[tokenURI] = true;

    return newBonsaiId;
  }

  function buyRwa(
    uint bonsaiId
  ) public payable {
    uint price = _idToBonsaiRwa[bonsaiId].price;
    address owner = ERC721.ownerOf(bonsaiId);

    require(msg.sender != owner, "You already own this NFT");
    require(msg.value == price, "Please submit the asking price");

    _idToBonsaiRwa[bonsaiId].isListed = false;
    _listedItems.decrement();

    _transfer(owner, msg.sender, bonsaiId);
    payable(owner).transfer(msg.value);
  }

  function placeNftOnSale(uint bonsaiId, uint newPrice) public payable {
    require(ERC721.ownerOf(bonsaiId) == msg.sender, "You are not owner of this nft");
    require(_idToBonsaiRwa[bonsaiId].isListed == false, "Item is already on sale");
    require(msg.value == listingPrice, "Price must be equal to listing price");

    _idToBonsaiRwa[bonsaiId].isListed = true;
    _idToBonsaiRwa[bonsaiId].price = newPrice;
    _listedItems.increment();
  }

  function _createBonsaiRwa(
    uint bonsaiId,
    uint price
  ) private {
    require(price > 0, "Price must be at least 1 wei");

    _idToBonsaiRwa[bonsaiId] = BonsaiRwa(
      bonsaiId,
      price,
      msg.sender,
      true
    );

    emit BonsaiRwaCreated(bonsaiId, price, msg.sender, true);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint bonsaiId,
    uint256 
  ) internal virtual override {
    super._beforeTokenTransfer(from, to, bonsaiId, 1);

    // minting token
    if (from == address(0)) {
      _addTokenToAllTokensDetailed(bonsaiId);
    } else if (from != to) {
      _removeTokenFromOwnerDetailed(from, bonsaiId);
    }

    if (to == address(0)) {
      _removeTokenFromAllTokensDetailed(bonsaiId);
    } else if (to != from) {
      _addTokenToOwnerDetailed(to, bonsaiId);
    }

  }

  function _addTokenToAllTokensDetailed(uint bonsaiId) private {
    _idToNftIndex[bonsaiId] = _allNfts.length;
    _allNfts.push(bonsaiId);
  }

  function _addTokenToOwnerDetailed(address to, uint bonsaiId) private {
    uint length = ERC721.balanceOf(to);
    _ownedTokens[to][length] = bonsaiId;
    _idToOwnedIndex[bonsaiId] = length;
  }

  function _removeTokenFromOwnerDetailed(address from, uint bonsaiId) private {
    uint lastTokenIndex = ERC721.balanceOf(from) - 1;
    uint tokenIndex = _idToOwnedIndex[bonsaiId];

    if (tokenIndex != lastTokenIndex) {
      uint lastBonsaiId = _ownedTokens[from][lastTokenIndex];

      _ownedTokens[from][tokenIndex] = lastBonsaiId;
      _idToOwnedIndex[lastBonsaiId] = tokenIndex;
    }

    delete _idToOwnedIndex[bonsaiId];
    delete _ownedTokens[from][lastTokenIndex];
  }
  function _removeTokenFromAllTokensDetailed(uint bonsaiId) private {
    uint lastTokenIndex = _allNfts.length - 1;
    uint tokenIndex = _idToNftIndex[bonsaiId];
    uint lastBonsaiId = _allNfts[lastTokenIndex];

    _allNfts[tokenIndex] = lastBonsaiId;
    _idToNftIndex[lastBonsaiId] = tokenIndex;

    delete _idToNftIndex[bonsaiId];
    _allNfts.pop();
  }
}