const { ethers } = require("hardhat");

async function deployContract(){
    const INA = await ethers.getContractFactory("INA")
    const ina = await INA.deploy()

    const txHash = ina.deployTransaction.hash
    const txReceipt = await ethers.provider.waitForTransaction(txHash)
    const contractAddress = txReceipt.contractAddress


    console.log("Contrato: ", contractAddress)
}


deployContract().then(() => process.exit(0)).catch((error) => {
    console.error(error)
    process.exit(1)
})