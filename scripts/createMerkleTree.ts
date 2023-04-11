import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import { ethers } from "hardhat";

const masterChefAddress = '0x1373D050d48B73Dc4cf8Ba7761A21Ee57E2B75cC'

const addresses = [
    ['0x53be46990e96d912a343dE24086B056aCF9EE024'],
    ['0xE7DB32c166fFdf2E04B383c24D7608C2b1C7260C'],
    ['0xC002F6Ef5101CE9e4C8A6dABe0fDE9cfCdfE011c'],
    ['0x8C18256b1414843C75D4fB3C2966D7b5C7172cac'],
    ['0xBA8feE942a683f0f321A7E61f31582B01279Bde2'],

    ['0xFBE21b2c323219a79b5FEe7dD4d6f5cA8a92BAE8'],
    ['0xa725371a4e68682E7DD9C08981bf8949fACBB00c'],
    ['0x2dB12Bd1f308D5692270100001EEe9Ea7d2F8953'],
    ['0x12a0dd19D3f878697c7A1F804AaA1dA84229566C'],
    ['0xFe7b0D6B3b4b3e9A35f83575fbA10c2d6E8C7Db2'],
    ['0xAC004ed417F1Df6F4116d4Ec1c896fB2263CA357'],
    ['0xA785750E133e76d516c8D91346769A65e06ceCdd'],
    ['0x9b2efDF581b7A200e994C761604Efd9af210c069'],
    ['0x87f28Fc31e72C2bc230229f23de20000DCBdd9Fc'],
    ['0xA84B9205F69782FeA9a9Fa5C33E5F0aF4C36Ce55'],
    ['0xef217E2b540BFc4D52e4a46aD7BeF9D59A264f83'],
    ['0x322334afC5476B536858BE79B35f85AcCd1A1BCE'],
    ['0xe5A238a7B9e88a6998D806316370A1818F907FD8'],
    ['0x7302ce39220469a3A78AE468A582b29B30B9BcD7'],
    ['0x7D535D941F9844472826cf04A247C27A8055dEc8'],
]

async function main() {
    const merkleTree = StandardMerkleTree.of(addresses, ["address"]);
    fs.writeFileSync("whitelistMerkleTree.json", JSON.stringify(merkleTree.dump()));

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