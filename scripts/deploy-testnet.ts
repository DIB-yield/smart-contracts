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
        1680969600,
    ]);
    await token.mint(deployer.address, ethers.utils.parseUnits("1000000", 18))
    await token.transferOwnership(masterChef.address);

    const usdt = await utils.deployAndVerify("MockToken", ["USDT", "USDT"]);
    const weth = await utils.deployAndVerify("MockToken", ["WETH", "WETH"]);
    usdt.mint(deployer.address, ethers.utils.parseUnits("1000", 18));
    weth.mint(deployer.address, ethers.utils.parseUnits("1000", 18));

    // await masterChef.add(1000, token.address, 400, false, true);
    // await masterChef.add(500, usdt.address, 400, false, true);
    // await masterChef.add(500, weth.address, 400, false, false);

    console.log("done");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
