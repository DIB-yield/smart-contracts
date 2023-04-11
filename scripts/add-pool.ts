import { ethers } from "hardhat";

const config = require("../config.js");
const utils = require("./utils");

const masterChefAddress = '0x1373D050d48B73Dc4cf8Ba7761A21Ee57E2B75cC';

const dib = {
    address: '0xF1ffE4687E6e77a9e2FF52Eb443c1334dfd1f51f',
    allocation: 120,
    depositFee: 400,
    withDepositDiscount: true
}

const dibEth = {
    address: '0x6f17c2fC504de7993B053a80E27f16c88C0C5120',
    allocation: 400,
    depositFee: 400,
    withDepositDiscount: true
}

const wethUsdt = {
    address: '0xBEb125e43B46F757ece0428cdE20cce336aF962E',
    allocation: 10,
    depositFee: 400,
    withDepositDiscount: true
}

const wethUsdc = {
    address: '0xC53e453E4A6953887bf447162D1dC9E1e7f16f60',
    allocation: 10,
    depositFee: 400,
    withDepositDiscount: true
}

const wbtcWeth = {
    address: '0x4CefE08Ea644291626F286DD9223Eaef932560c4',
    allocation: 10,
    depositFee: 400,
    withDepositDiscount: true
}

const arbEth = {
    address: '0x1713f5d04a741a2dD2d026Ce7cAb5614a499e1c0',
    allocation: 10,
    depositFee: 400,
    withDepositDiscount: true
}

const bananaEth = {
    address: '0x87870a3F29eC9683d346FFD4f7330Dd1b46264c2',
    allocation: 10,
    depositFee: 400,
    withDepositDiscount: true
}

async function addPool(masterChef, poolConfig, withUpdate = false) {
    console.log(`adding pool for ${poolConfig.address}`);
    await masterChef.add(
        poolConfig.allocation, 
        poolConfig.address, 
        poolConfig.depositFee, 
        withUpdate, 
        poolConfig.withDepositDiscount
    );
    console.log(`pool ${poolConfig.address} added\n`)
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    const MasterChef = await ethers.getContractFactory("DibYieldMasterChef")
    const masterChef = await MasterChef.attach(masterChefAddress);

    console.log('adding dib')
    await addPool(masterChef, dib);

    console.log('adding pair')
    await addPool(masterChef, dibEth)

    await addPool(masterChef, wethUsdt);

    await addPool(masterChef, wethUsdc);

    await addPool(masterChef, wbtcWeth);
    
    await addPool(masterChef, arbEth);

    await addPool(masterChef, bananaEth);

    console.log('done')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
