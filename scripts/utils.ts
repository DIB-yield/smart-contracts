import { ethers, network, run } from "hardhat";

export async function deployAndVerify(contractName: string, args: any[]): Contract {
    const Contract = await ethers.getContractFactory(contractName);

    console.log("Deploying Contact...");
    const contract = await Contract.deploy(...args);
    console.log(`${contractName} deployed to: ${contract.address}`);

    await contract.deployed();
    console.log("Done");

    console.log("waiting for 5 confirmations before verification");
    await contract.deployTransaction.wait(2);

    const networkName = network.name;
    console.log("Network:", networkName);
    if (networkName != "hardhat") {
        console.log("Verifying contract...");
        try {
            await run("verify:verify", {
                address: contract.address,
                constructorArguments: args,
            });
            console.log("Contract is Verified");
        } catch (error: any) {
            console.log("Failed in plugin", error.pluginName);
            console.log("Error name", error.name);
            console.log("Error message", error.message);
        }
    }
    return contract;
}
