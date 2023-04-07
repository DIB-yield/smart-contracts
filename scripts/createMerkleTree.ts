import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import { ethers } from "hardhat";

const masterChefAddress = '0xD5237Cf901aFE24E2fF470a2bF043BD971aCB216'

const deployer1Address = '0xca13600DC65Ec60E20142b813b5D8024932f0059';
const deployer2Address = '0x68D3d8A253f9d566531c026Edc3fd0D4931790f4';

async function main() {
    const merkleTree = StandardMerkleTree.of([[deployer1Address], [deployer2Address]], ["address"]);
    fs.writeFileSync("whitelistMerkleTree.json", JSON.stringify(merkleTree.dump()));

    /*
    const MasterChef = await ethers.getContractFactory("DibYieldMasterChef")
    const masterChef = await MasterChef.attach(masterChefAddress);

    await masterChef.setWhitelistMerkleRoot(merkleTree.root);
    */
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });