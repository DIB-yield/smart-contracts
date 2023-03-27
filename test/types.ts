import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export interface EnvResult {
    masterChef: Contract;
    dibToken: Contract;

    usdt: Contract;
    weth: Contract;

    owner: SignerWithAddress;
    alice: SignerWithAddress;
    bob: SignerWithAddress;
    dev: SignerWithAddress;
}
