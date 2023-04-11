import { ethers } from "hardhat";

const config = require("../config.js");
const utils = require("./utils");

const masterChefAddress = config.masterChefAddress;

const arbEth = {
    allocation: 0,
    depositFee: 0,
    withDepositDiscount: false
}

async function setPool(masterChef: any, id: number, poolConfig: any, withUpdate = false) {
    console.log(`setting pool`);
    await masterChef.set(
        id, 
        poolConfig.allocation, 
        poolConfig.depositFee, 
        withUpdate, 
        poolConfig.withDepositDiscount
    );
    console.log(`pool set\n`)
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    const MasterChef = await ethers.getContractFactory("DibYieldMasterChef")
    const masterChef = await MasterChef.attach(masterChefAddress);

    await setPool(masterChef, 6, arbEth)

    console.log('done')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
