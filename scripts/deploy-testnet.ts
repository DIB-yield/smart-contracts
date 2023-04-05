import { ethers } from "hardhat";

const config = require("../config.js");
const utils = require("./utils");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    const token = await utils.deployAndVerify("DibYieldToken", []);
    const masterChef = await utils.deployAndVerify("DibYieldMasterChef", [
        token.address,
        deployer.address,
        deployer.address,
        ethers.utils.parseUnits("4", 18),
        1679996317,
    ]);
    await token.transferOwnership(masterChef.address);

    const MockToken = await ethers.getContractFactory("MockToken");
    const usdt = await MockToken.deploy("USDT", "USDT");
    const weth = await MockToken.deploy("WETH", "WETH");
    usdt.mint(deployer.address, ethers.utils.parseUnits("1000", 18));
    weth.mint(deployer.address, ethers.utils.parseUnits("1000", 18));

    await masterChef.add(1000, usdt.address, 400, false, true);
    await masterChef.add(500, weth.address, 400, false, false);

    console.log("done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
