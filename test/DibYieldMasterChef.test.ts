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
        usdt.mint(bob.address, ethers.utils.parseUnits("1000", 18));
        weth.mint(alice.address, ethers.utils.parseUnits("1000", 18));
        weth.mint(bob.address, ethers.utils.parseUnits("1000", 18));

        const MasterChef = await ethers.getContractFactory("DibYieldMasterChef");

        const currentBlock = await ethers.provider.getBlockNumber();
        const currentTime = (await ethers.provider.getBlock(currentBlock)).timestamp;

        const masterChef = await MasterChef.deploy(
            dibToken.address,
            dev.address,
            dev.address,
            "1000000",
            currentTime + 60
        );

        await dibToken.transferOwnership(masterChef.address);

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
            usdt,
        };
    }

    it("should take fee on deposit", async () => {
        const { masterChef, alice, usdt } = await loadFixture(prepareEnv);
        const amount = ethers.utils.parseUnits("1000", 18);
        await usdt.connect(alice).approve(masterChef.address, amount);
        await masterChef.connect(alice).deposit(0, amount, 0, []);

        const aliceInfo = await masterChef.userInfo(0, alice.address);
        expect(aliceInfo.amount).equal(parseUnits("960", 18));
    });

    describe("pre launch whitelist", () => {
        it("should take discounted fee on deposit from whitelist", async () => {
            const { masterChef, alice, bob, usdt } = await loadFixture(prepareEnv);
            const merkleTree = StandardMerkleTree.of([[alice.address], [bob.address]], ["address"]);
            await masterChef.setWhitelistMerkleRoot(merkleTree.root);
            const proof = merkleTree.getProof([alice.address]);
            const amount = ethers.utils.parseUnits("1000", 18);
            await usdt.connect(alice).approve(masterChef.address, amount);
            await masterChef.connect(alice).deposit(0, amount, 0, proof);
            const aliceInfo = await masterChef.userInfo(0, alice.address);
            expect(aliceInfo.amount).equal(parseUnits("980", 18));
        });

        it("should not make discount after project launch", async () => {
            const { masterChef, alice, bob, usdt } = await loadFixture(prepareEnv);
            const merkleTree = StandardMerkleTree.of([[alice.address], [bob.address]], ["address"]);
            await masterChef.setWhitelistMerkleRoot(merkleTree.root);
            const proof = merkleTree.getProof([alice.address]);
            const amount = ethers.utils.parseUnits("1000", 18);
            await usdt.connect(alice).approve(masterChef.address, amount);
            const launchTime = await masterChef.startTime();
            await time.increase(86400);
            await masterChef.connect(alice).deposit(0, amount, 0, proof);
            const aliceInfo = await masterChef.userInfo(0, alice.address);
            expect(aliceInfo.amount).equal(parseUnits("960", 18));
        });
    });

    describe("lockups", () => {
        it("should fail if wrong lockup period is passed", async () => {
            const oneDay = 86400;
            const month = oneDay * 30;

            const { masterChef, alice, bob, usdt } = await loadFixture(prepareEnv);

            const amount = ethers.utils.parseUnits("1000", 18);
            await usdt.connect(alice).approve(masterChef.address, amount);
            await expect(
                masterChef.connect(alice).deposit(0, amount, month + 1, [])
            ).to.be.revertedWith("wrong lock period");
        });

        it("should give discount with lock period", async () => {
            const oneDay = 86400;
            const month = oneDay * 30;

            const { masterChef, alice, usdt } = await loadFixture(prepareEnv);

            const amount = ethers.utils.parseUnits("1000", 18);
            await usdt.connect(alice).approve(masterChef.address, amount);
            await masterChef.connect(alice).deposit(0, amount, month, []);

            const aliceInfo = await masterChef.userInfo(0, alice.address);
            expect(aliceInfo.amount).equal(parseUnits("966", 18));
        });

        it("sets correct unlock time on first deposit", async () => {
            const oneDay = 86400;
            const month = oneDay * 30;

            const { masterChef, alice, usdt } = await loadFixture(prepareEnv);

            const amount = ethers.utils.parseUnits("1000", 18);
            await usdt.connect(alice).approve(masterChef.address, amount);
            const tx = await masterChef.connect(alice).deposit(0, amount, month, []);
            const waitedTx = await tx.wait();
            const blockNumber = waitedTx.blockNumber;
            const miningTime = (await ethers.provider.getBlock(blockNumber)).timestamp;

            const aliceInfo = await masterChef.userInfo(0, alice.address);
            expect(aliceInfo.unlockTime).equal(miningTime + month);
        });

        it("should not allow to withdraw before unlock time", async () => {
            const oneDay = 86400;
            const month = oneDay * 30;

            const { masterChef, alice, usdt } = await loadFixture(prepareEnv);

            const amount = ethers.utils.parseUnits("1000", 18);
            await usdt.connect(alice).approve(masterChef.address, amount);
            await masterChef.connect(alice).deposit(0, amount, month, []);

            await expect(masterChef.connect(alice).withdraw(0, parseUnits("900", 18))).to.be.revertedWith("not yet");

            const aliceInfo = await masterChef.userInfo(0, alice.address);
            await time.increaseTo(aliceInfo.unlockTime);
            await masterChef.connect(alice).withdraw(0, parseUnits("900", 18));
            
        }) 

        it("should correctly recalculate unlock time", async () => {
            const oneDay = 86400;
            const month = oneDay * 30;

            const {masterChef} = await loadFixture(prepareEnv);
            let oldAmount = parseUnits("100", 18);
            let lockTimeLeft = oneDay;
            let lockTime = month
            let amount = parseUnits("100", 18)
            let newLockTime = await masterChef.calculateUnlockTime(oldAmount, lockTimeLeft, amount, lockTime);
            expect(newLockTime).equal((oneDay + month) / 2);

            oldAmount = parseUnits("100", 18);
            lockTimeLeft = 0;
            lockTime = month
            amount = parseUnits("100", 18)
            newLockTime = await masterChef.calculateUnlockTime(oldAmount, lockTimeLeft, amount, lockTime);
            expect(newLockTime).equal((month) / 2);

            oldAmount = parseUnits("100", 18);
            lockTimeLeft = month;
            lockTime = 0;
            amount = parseUnits("100", 18);
            newLockTime = await masterChef.calculateUnlockTime(oldAmount, lockTimeLeft, amount, lockTime);
            expect(newLockTime).equal((month) / 2);

            oldAmount = parseUnits("100", 18);
            lockTimeLeft = month;
            lockTime = month;
            amount = 0;
            newLockTime = await masterChef.calculateUnlockTime(oldAmount, lockTimeLeft, amount, lockTime);
            expect(newLockTime).equal(month);

            oldAmount = 0;
            lockTimeLeft = 30 * month;
            lockTime = month;
            amount = parseUnits("100", 18);
            newLockTime = await masterChef.calculateUnlockTime(oldAmount, lockTimeLeft, amount, lockTime);
            expect(newLockTime).equal(month);
        })
    });
});
