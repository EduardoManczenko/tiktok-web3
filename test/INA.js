const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("INA", function(){
    async function deploy(){
        const [
            owner, 
            privateSaleBank,
            publicSaleBank,
            vurseIncentivizing,
            marketingPartnership,
            founderTeam,
            advisers,
            companyReserves,
            lpReward,
            futuresDevelopment
        ] = await ethers.getSigners()

        const INA = await ethers.getContractFactory("INA")
        const USDT = await ethers.getContractFactory("USDT")
        const usdt = await USDT.deploy()
        const ina = await INA.deploy(usdt.address)

        return {
            usdt,
            ina,
            owner,
            privateSaleBank,
            publicSaleBank,
            vurseIncentivizing,
            marketingPartnership,
            founderTeam,
            advisers,
            companyReserves,
            lpReward,
            futuresDevelopment
        }
    }

    describe("Deployment", function(){
        it("Check if the Tokenomics balances are correct",
        async function(){
            const {
                usdt,
                ina,
                owner,
                privateSaleBank,
                publicSaleBank,
                vurseIncentivizing,
                marketingPartnership,
                founderTeam,
                advisers,
                companyReserves,
                lpReward,
                futuresDevelopment
            } = await loadFixture(deploy)

            let arrWallets = [
                owner.address, 
                privateSaleBank.address,
                publicSaleBank.address,
                vurseIncentivizing.address,
                marketingPartnership.address,
                founderTeam.address,
                advisers.address,
                companyReserves.address,
                lpReward.address,
                futuresDevelopment.address
            ]

            let tokenomics = [
                '0',
                '90000000000000000000000000',
                '150000000000000000000000000',
                '100000000000000000000000000',
                '170000000000000000000000000',
                '100000000000000000000000000',
                '10000000000000000000000000',
                '160000000000000000000000000',
                '100000000000000000000000000',
                '55000000000000000000000000'
            ]

            for(let i = 0; i < arrWallets.length; i ++){
                let tx = await ina.balanceOf(arrWallets[i])
                let balance = tx.toString()
                let supply = tokenomics[i]

                expect(balance).to.equal(supply)

                //console.log(i ," ",arrWallets[i], ": ", balance)
            }
            console.log(usdt.address, ina.address)
        })

       
    })
})