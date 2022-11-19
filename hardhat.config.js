/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
const { PRIVATE_KEY } = process.env


module.exports = {
  networks:{
    hardhat:{

    },
    PolygonMumbai:{
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [PRIVATE_KEY]
    }
  },
  solidity: "0.8.17",
};
