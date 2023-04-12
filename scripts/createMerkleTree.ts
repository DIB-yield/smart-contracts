import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import { ethers } from "hardhat";
const config = require("../config.js");

const masterChefAddress = config.masterChefAddress;

const addresses = require('../assets/whitelistAddresses.json');

async function main() {
    const merkleTree = StandardMerkleTree.of(addresses, ["address"]);
    fs.writeFileSync("assets/whitelistMerkleTree.json", JSON.stringify(merkleTree.dump()));

    const MasterChef = await ethers.getContractFactory("DibYieldMasterChef")
    const masterChef = await MasterChef.attach(masterChefAddress);

    await masterChef.setWhitelistMerkleRoot(merkleTree.root);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });