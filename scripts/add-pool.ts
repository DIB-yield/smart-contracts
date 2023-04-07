import { ethers } from "hardhat";

const config = require("../config.js");
const utils = require("./utils");

const masterChefAddress = '0xD5237Cf901aFE24E2fF470a2bF043BD971aCB216';
const dibAddress = '0xF1518a4273F25Bab55474e8218eb97b335d657F0';
const dibEthPair = '0x154E4E3E073b86c9fe5330ECaBA233132aFaeAa8'
const usdtAddress = '0x330D6826EEe0fB293431ffE6E56A8bD33CaD8020';
const wethAddress = '0x9418c926462D42E15a50353Bde0b68cfF1CfeB74';

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    const MasterChef = await ethers.getContractFactory("DibYieldMasterChef")
    const masterChef = await MasterChef.attach(masterChefAddress);

    console.log('adding dib')
    await masterChef.add(1000, dibAddress, 400, false, false);

    console.log('adding pair')
    await masterChef.add(1000, dibEthPair, 0, false, false);

    console.log('adding weth')
    await masterChef.add(500, wethAddress, 400, false, true);

    console.log('adding usdt')
    await masterChef.add(500, usdtAddress, 400, false, true);

    console.log('done')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
