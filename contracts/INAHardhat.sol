// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./@openzeppelin/contracts/token/ERC20/ERC20Ina.sol";

import "./@openzeppelin/contracts/token/ERC20/ERC20.sol";

//only work in testnet/main
// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract USDT is ERC20{
    constructor()
    ERC20("USDT", "USDT"){
        _mint(msg.sender, 15000000 * 10 ** decimals());
    }
}


contract INA is ERC20Ina{
    address privateSaleBank;
    address publicSaleBank;
    address vurseIncentivizing;
    address marketingPartnership;
    address founderTeam;
    address advisers;
    address companyReserves;
    address lpReward;
    address futuresDevelopment;

    address owner;
    bool privateSaleControl = true;
    

    address usdtContract;

    // Only work in testnet/main
    // AggregatorV3Interface internal priceFeedEthUsd;
    // AggregatorV3Interface internal priceFeedMaticUsd;

    constructor(address _usdtContract)
    ERC20Ina("INANI token","INA"){
        owner = msg.sender;
        privateSaleBank = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        publicSaleBank = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        vurseIncentivizing = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        marketingPartnership = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        founderTeam = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
        advisers = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
        companyReserves = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
        lpReward = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;
        futuresDevelopment = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;

        usdtContract = _usdtContract;

        //only work in testnet/main
        // priceFeedEthUsd = AggregatorV3Interface(0x0715A7794a1dc8e42615F059dD6e406A6594651A);
        // priceFeedMaticUsd = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);

        _mint(privateSaleBank, 90000000 * 10 ** decimals());
        _mint(publicSaleBank, 150000000 * 10 ** decimals());
        _mint(vurseIncentivizing, 100000000 * 10 ** decimals());
        _mint(marketingPartnership, 170000000 * 10 ** decimals());
        _mint(founderTeam, 100000000 * 10 ** decimals());
        _mint(advisers, 10000000 * 10 ** decimals());
        _mint(companyReserves, 160000000 * 10 ** decimals());
        _mint(lpReward, 100000000 * 10 ** decimals());
        _mint(futuresDevelopment, 55000000 * 10 ** decimals());

    }

    modifier onlyOwner(){
        require(msg.sender == owner, "ERROR: You're not the owner");
        _;
    }

    modifier sixMonthsOpen(){
        require(block.timestamp <= block.timestamp + (30 * 6 * 1 days), "ERROR: Closed private sale");
        _;
    }


    //only work in Testnet/main
    // ETH and Matic Price, hardhat vm unable, and require change priceFeed address to work in mainnet and change the import for @chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol

    //returns wei
    // function ethPriceUsd() internal view returns(int256) {
    //     ( , int256 answer , , ,) = priceFeedEthUsd.latestRoundData();
    //     return (answer * 10000000000);
    // }

    // function maticPriceUsd() internal view returns(int256){
    //     ( , int256 answer, , ,) = priceFeedMaticUsd.latestRoundData();
    //     return (answer * 10000000000);
    // }


    function privateSaleBuy(uint _amountINA, uint _paymentChoice)external sixMonthsOpen(){
        require(privateSaleControl, "ERROR: Private sale Locked");
        address userAddress = msg.sender;
        //10 = usdt
        //20 = weth
        //30 = matic
        if(_paymentChoice == 10){
            //the way we make the function for buying with ETH and MATIC is the same as soon as we have the function that returns its price in usd

            ERC20 usdt = ERC20(usdtContract);
            ERC20 ina = ERC20(address(this));

            uint usdtPrice = 160000000000000000; // * private sale supply = $14.400.000 the price need to change for $0,1666667 to private sale supply = $15.000.003 or reform the price and the total supply so as not to break in periodic tithes

            uint usdtTransferAmount = _amountINA * usdtPrice;
            uint INATransferAmount = _amountINA * 10 ** 18;

            require(usdt.balanceOf(userAddress) >= usdtTransferAmount, "ERROR: No balance usdt");
            require(balanceOf(privateSaleBank) > 0, "ERROR: Sold off/finish");
    
            usdt.transferFrom(userAddress, privateSaleBank, usdtTransferAmount);
            ina.transferFrom(privateSaleBank, userAddress, INATransferAmount);
            
            
        }else if(_paymentChoice == 20){
            //OnlyWork in testNet cause function ethPrice dont work in hardhat vm
        }else if(_paymentChoice == 30){
            //OnlyWork in testNet cause function maticPrice dont work in hardhat vm
        }
    }

  

    function privateSaleUnlock()external onlyOwner(){
        privateSaleControl = true;
    }
    function privateSaleLock()external onlyOwner(){
        privateSaleControl = false;
    }

    function addFromBlacklist(address _address)external onlyOwner(){
        blacklist[_address] = true;
    }
    function removeFromBlacklist(address _address)external onlyOwner(){
        blacklist[_address] = false;
    }
}

//for the code below, I will not create any test environment on hardhat (demo test environment only on INA)

contract accountFactory{
    userAccount[] allAccounts;

    function create(address owner_, string memory userName_, string memory userSymbol_)public{
        userAccount txx = new userAccount(owner_, userName_, userSymbol_);
        allAccounts.push(txx);
    }

    function returnAllAccounts()external view returns(userAccount[] memory){
        return allAccounts;
    }
}


contract userAccount is ERC20{
    address public owner;

    uint256 totalPoints;
    uint256 followers;
    uint256 totalPublications;
    uint256 totalLikes;
    uint256 totalComments;

    address inaAddress;

    publication[] publicationsAddress;

    mapping(address => bool) public followersControl;

    constructor(address _owner, string memory _userName, string memory _userSymbol)
    ERC20(_userName, _userSymbol){

        _mint(owner, 100 * 10 ** decimals());

        owner = _owner;
        totalPoints = 0;
        followers = 0;   
        totalPublications = 0;
        totalLikes = 0;
        totalComments = 0;
        inaAddress = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    }
    modifier onlyOwner(){
        require(msg.sender == owner, "ERROR: You're not the owner");
        _;
    }

    function buyUserToken(uint256 _amount)external{
        ERC20Ina ina = ERC20Ina(inaAddress);
        ERC20 userToken = ERC20(address(this));

      
        uint256 price = calcStockValue();

        uint256 amountIna = _amount * price;
        uint256 amountUserToken = _amount * 10 ** 18;
        require(ina.balanceOf(msg.sender) >= amountIna, "ERROR: balance");
        
        ina.transferFrom(msg.sender, owner, amountIna);
        userToken.transferFrom(owner, msg.sender, amountUserToken);
    }

    function follow()external{
        require(!followersControl[msg.sender], "Following");
        followersControl[msg.sender] = true;
        followers += 1;
    }

    function unfollow()external{
        require(followersControl[msg.sender], "Unfollowing");
        followersControl[msg.sender] = false;
        followers -= 1;
    }

    function createPublication(string memory description_, string memory video_)external onlyOwner(){
        publication txx = new publication(description_, video_, address(this));
        publicationsAddress.push(txx);
        totalPublications +=1;
    }

    function returnPublicationAddressArray()public view returns(publication[] memory){
        return publicationsAddress;
    }

    function calcStockValue()public returns(uint256){
        updateTotaLikesAndComments();

        uint256 newTotalPoints = 0; 
        newTotalPoints = followers + totalPublications + totalLikes + totalComments;
        totalPoints = newTotalPoints;
        uint256 price = (((totalPoints) * 10 ** 18) / 100);
        return price;
    }

    function updateTotaLikesAndComments()internal{
        uint256 newTotalLikes = 0;
        uint256 newTotalComments = 0;
        for(uint i = 0; i <= publicationsAddress.length; i++){
            publication txx = publication(publicationsAddress[i]);
            uint txLikes = txx.returnTotaLike();
            uint txComments = txx.returnTotalComments();
            newTotalLikes += txLikes;
            newTotalComments += txComments;
        }
        totalLikes = newTotalLikes;
        totalComments = newTotalComments;
    }

}

contract publication{
    address public _owner;
    string _description;
    string _video;

    uint256 totalLike;
    uint256 totalComments;

    mapping(address => bool) likeControl;

    string[] public allComments;

    constructor(string memory description_, string memory video_, address owner_){
        _description = description_;
        _video = video_;
        _owner = owner_;
        totalLike = 0;
        totalComments = 0;
    }
    

    function returnPublication()public view returns(string memory, string memory){
        return (_description, _video);
    }

    function likeThis()external{
        require(!likeControl[msg.sender], "Liked");
        likeControl[msg.sender] = true;
        totalLike += 1;
    }
    function unlikeThis()external{
        require(likeControl[msg.sender], "Unliked");
        likeControl[msg.sender] = false;
        totalLike -= 1;
    }

    function commentThis(string memory _message)external{
        allComments.push(_message);
    }

    function returnAllComments()external view returns(string[] memory){
        return allComments;
    }

    function returnTotaLike()external view returns(uint256){
        return totalLike;
    }

    function returnTotalComments()external view returns(uint256){
        return totalComments;
    }
}