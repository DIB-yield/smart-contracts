import { ethers } from "hardhat";

const config = require("../config.js");
const utils = require("./utils");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    const token = await utils.deployAndVerify("DibYieldToken", []);
    const masterChef = await utils.deployAndVerify("DibYieldMasterChef", 
            [
                token.address, 
                deployer.address,
                deployer.address,
                ethers.utils.parseUnits("4", 18),
                1679996317
            ])
    await token.transferOwnership(masterChef.address);
    console.log('done')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
