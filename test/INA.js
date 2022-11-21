const {
    time,
    loadFixture,
    helpers
  } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { HARDHAT_MEMPOOL_SUPPORTED_ORDERS } = require("hardhat/internal/constants");



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
            futuresDevelopment, 
            user1,
            user2,
            user3
        ] = await ethers.getSigners()

        const INA = await ethers.getContractFactory("INA")
        const USDT = await ethers.getContractFactory("USDT")
        const usdt = await USDT.deploy()
        const ina = await INA.deploy(usdt.address)

        //permissão para movimentar o INA movimentar INA das outras carteiras
        await ina.connect(privateSaleBank).increaseAllowance(ina.address, "90000000000000000000000000")
        await ina.connect(publicSaleBank).increaseAllowance(ina.address, "150000000000000000000000000")

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
            futuresDevelopment,
            user1,
            user2,
            user3
        }
    }

    describe("Deployment", function(){
        it("Check if the Tokenomics balances are correct",
        async function(){
            const {
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

                // console.log(i ," ",arrWallets[i], ": ", balance)
            }   
        })

        it("Check if the founder/team wallet is locked", async function (){
            const {ina , founderTeam, user1} = await loadFixture(deploy)

            try{await ina.connect(founderTeam).transfer(user1.address, 1000)}catch{}

            let balanceFounder = await ina.connect(founderTeam).balanceOf(founderTeam.address)

            let balanceUser1 = await ina.connect(user1).balanceOf(user1.address)

            // console.log("founder: ", balanceFounder)
            // console.log("user: ", balanceUser1)

            expect(balanceFounder.toString()).to.equal('100000000000000000000000000')
            expect(balanceUser1.toString()).to.equal('0')
        })

        it("Check if founder/team loot will be unlocked after one year", async function(){
            const {ina, founderTeam, user1} = await loadFixture(deploy)

            let initialBalance = await ina.balanceOf(founderTeam.address)

            await network.provider.send("evm_increaseTime", [30 * 12 * 86400])
            // await time.increase(30 * 12 * 86400)
            await network.provider.send("evm_mine")

            await ina.connect(founderTeam).transfer(user1.address, "100000000000000000000000000")

            let newBalance = await ina.balanceOf(founderTeam.address)

            expect(newBalance.toString()).to.equal('0')
            // console.log("Beggining: ",initialBalance.toString())
            // console.log("End: ", newBalance.toString())
        })

        it("Check permission for INA to move tokens from public/private sale wallets", async function(){
            const { ina, user1, privateSaleBank, publicSaleBank } = await loadFixture(deploy)

            
            
            let allowancePrivate = await ina.allowance(privateSaleBank.address, ina.address)
            let allowancePublic = await ina.allowance(publicSaleBank.address, ina.address)

            // console.log(allowancePrivate.toString(), allowancePublic.toString())


            expect(allowancePrivate.toString()).to.equal('90000000000000000000000000')

            expect(allowancePublic.toString()).to.equal('150000000000000000000000000')

            
        })

        it("Check total raised in private sale = $14,400,000 ~ $0.16 per token", async function (){
            const { ina, usdt, owner, privateSaleBank, user1} = await loadFixture(deploy)
            
            await usdt.connect(owner).approve(ina.address, "15000000000000000000000000")
  
            await ina.connect(owner).privateSaleBuy("90000000", "10")

            let privateSaleInaBalance = await ina.connect(privateSaleBank).balanceOf(privateSaleBank.address)
            let privateSaleUsdtBalance = await usdt.connect(privateSaleBank).balanceOf(privateSaleBank.address)

            let userInaBalance = await usdt.connect(privateSaleBank).balanceOf(owner.address)
            let userUsdtBalance = await ina.connect(privateSaleBank).balanceOf(owner.address)

            expect(privateSaleInaBalance.toString()).to.equal("0")
            expect(privateSaleUsdtBalance.toString()).to.equal("14400000000000000000000000")
            expect(userInaBalance.toString()).to.equal("600000000000000000000000")
            expect(userUsdtBalance.toString()).to.equal("90000000000000000000000000")



            // console.log(owner.address)
            // console.log("private sale wallet: ")
            // console.log("INA: ", privateSaleInaBalance.toString())
            // console.log("usdt: ", privateSaleUsdtBalance.toString())
            // console.log('\nowner: ')
            // console.log("INA: ", userInaBalance.toString())
            // console.log("usdt: ", userUsdtBalance.toString())
        })

        it("Check if the usdt balance is being forwarded to the bank (private sale) after the sale", async function(){
            const { ina, usdt, owner, privateSaleBank, publicSaleBank} = await loadFixture(deploy)

            await usdt.connect(owner).approve(ina.address, "15000000000000000000000000")

            await ina.connect(owner).privateSaleBuy("90000000", "10")

            let balancePrivateSaleBank = await usdt.balanceOf(privateSaleBank.address)

            expect(balancePrivateSaleBank.toString()).to.equal("14400000000000000000000000")
            //console.log(balancePrivateSaleBank.toString())       
        })

        it("Check if it is possible to buy in the private sale after interruption by the administrator", async function(){
            const { ina, usdt, owner, user1} = await loadFixture(deploy)

            await usdt.connect(user1).approve(ina.address, "200000")
            await usdt.connect(owner).transfer(user1.address, "200000")
            await ina.connect(owner).privateSaleLock()

            await expect(ina.connect(user1).privateSaleBuy("200000", "10")).to.be.revertedWith("ERROR: Private sale Locked")
        })

        it("Check if the wallet blocked by the administrator can make transfers", async function(){
            const { ina, privateSaleBank, user1, user2, owner} = await loadFixture(deploy)

            await ina.connect(privateSaleBank).transfer(user1.address, "20")

            await ina.connect(owner).addFromBlacklist(user1.address)

            await expect(ina.connect(user1).transfer(user2.address, "20")).to.be.revertedWith("ERROR: You are on the Blacklist")
        })

        it("Check if locked wallet can make transactions after unlocking", async function(){
            const { ina, privateSaleBank, user1, user2, owner} = await loadFixture(deploy)

            await ina.connect(privateSaleBank).transfer(user1.address, "20")

            await ina.connect(owner).addFromBlacklist(user1.address)

            await expect(ina.connect(user1).transfer(user2.address, "20")).to.be.revertedWith("ERROR: You are on the Blacklist")

            await ina.connect(owner).removeFromBlacklist(user1.address)

            await ina.connect(user1).transfer(user2.address, "20")

            let balanceUser2 = await ina.balanceOf(user2.address)

            expect(balanceUser2.toString()).to.equal("20")
        })

        it("Check if any user can blacklist another", async function(){
            const { ina, user1, owner} = await loadFixture(deploy)
            await expect(ina.connect(user1).addFromBlacklist(owner.address)).to.be.revertedWith("ERROR: You're not the owner")
        })

        it("Check if another user can block the private sale", async function(){
            const { ina, user1 } = await loadFixture(deploy)
            await expect(ina.connect(user1).privateSaleLock()).to.be.revertedWith("ERROR: You're not the owner")
        })

    })
})