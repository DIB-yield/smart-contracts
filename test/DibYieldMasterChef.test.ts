import { BigNumber } from "ethers";
import { ethers, tracer } from "hardhat";
import { expect } from "chai";
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

import { EnvResult } from "./types";

const { parseUnits } = ethers.utils;

describe("MasterChef test", function () {

    async function prepareEnv(): Promise<EnvResult> {
        const [owner, alice, bob, dev] = await ethers.getSigners();

        const DibToken = await ethers.getContractFactory("DibYieldToken");
        const dibToken = await DibToken.deploy();

        const MockToken = await ethers.getContractFactory("MockToken");
        const usdt = await MockToken.deploy("USDT", "USDT");
        const weth = await MockToken.deploy("WETH", "WETH");
        usdt.mint(alice.address, ethers.utils.parseUnits("1000", 18));
        usdt.mint(bob.address, ethers.utils.parseUnits("1000", 18))
        weth.mint(alice.address, ethers.utils.parseUnits("1000", 18))
        weth.mint(bob.address, ethers.utils.parseUnits("1000", 18))

        const MasterChef = await ethers.getContractFactory("DibYieldMasterChef");

        const currentBlock = await ethers.provider.getBlockNumber();
        const currentTime = (await ethers.provider.getBlock(currentBlock)).timestamp;

        const masterChef = await MasterChef.deploy(
            dibToken.address, dev.address, dev.address, "1000000", currentTime + 60);

        await masterChef.add(1000, usdt.address, 400, false);
        await masterChef.add(500, weth.address, 400, false);

        return {
            masterChef, 
            dibToken,
            owner, 
            alice, 
            bob,
            dev,
            weth,
            usdt
        }
    }

    it("should take fee on deposit", async () => {
        const {masterChef, alice, usdt} = await loadFixture(prepareEnv);
        const amount = ethers.utils.parseUnits("1000", 18);
        await usdt.connect(alice).approve(masterChef.address, amount);
        await masterChef.connect(alice).deposit(0, amount, 0, []);

        const aliceInfo = await masterChef.userInfo(0, alice.address);
        expect(aliceInfo.amount).equal(parseUnits("960", 18))
    });

    it("should take discounted fee on deposit from whitelist", async () => {
        const {masterChef, alice, bob, usdt} = await loadFixture(prepareEnv);

        const merkleTree = StandardMerkleTree.of([[alice.address], [bob.address]], ['address'])

        await masterChef.setWhitelistMerkleRoot(merkleTree.root);

        const proof = merkleTree.getProof([alice.address]);

        const valid = merkleTree.verify([alice.address], proof)
        console.log({valid})

        const amount = ethers.utils.parseUnits("1000", 18);
        await usdt.connect(alice).approve(masterChef.address, amount);
        console.log({merkleTree});
        console.log({proof});
        await masterChef.connect(alice).deposit(0, amount, 0, proof);

        const aliceInfo = await masterChef.userInfo(0, alice.address);
        expect(aliceInfo.amount).equal(parseUnits("980", 18));
    });

});
