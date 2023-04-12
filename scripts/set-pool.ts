import { ethers } from "hardhat";

const config = require("../config.js");
const utils = require("./utils");

const masterChefAddress = config.masterChefAddress;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    const MasterChef = await ethers.getContractFactory("DibYieldMasterChef");
    const masterChef = await MasterChef.attach(masterChefAddress);

    const pool = utils.getPoolConfigByName("dib");
    await setPool(masterChef, pool, true);

    console.log('done');
}

async function setPool(masterChef: Contract, poolConfig: any, withUpdate = false) {
    console.log(`setting pool ${poolConfig.name}`);
    await masterChef.set(
        poolConfig.pid, 
        poolConfig.allocation, 
        poolConfig.depositFee, 
        withUpdate, 
        poolConfig.withDepositDiscount
    );
    console.log(`pool set\n`)
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
