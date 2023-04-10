import { ethers } from "hardhat";

const config = require("../config.js");
const utils = require("./utils");

const masterChefAddress = '0xf9540A06B4639E8E0790BCFf77401d96be7449f2';
const dibAddress = '0xE844Fe8550231ADE194A8e8b77672ded405fD233';
const dibEthPair = '0x29b181D9D6Dc644a497A70e497d6e60f45D721D7';

const bananaEthPair = '0x87870a3F29eC9683d346FFD4f7330Dd1b46264c2';


async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    const MasterChef = await ethers.getContractFactory("DibYieldMasterChef")
    const masterChef = await MasterChef.attach(masterChefAddress);

    console.log('adding dib')
    await masterChef.add(120, dibAddress, 400, false, true);

    console.log('adding pair')
    await masterChef.add(400, dibEthPair, 0, false, true);

    console.log('adding BANANA/ETH')
    await masterChef.add(10, bananaEthPair, 0, false, true);


    console.log('done')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
