import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const config = require("../config.js");

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployer } = await hre.getNamedAccounts();

    const result = await hre.deployments.deploy("Token", {
        from: deployer,
        args: [config.initialSupply],
        log: true,
        autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
    });

    if (hre.network.name != "hardhat") {
        console.log("Verifying contract...");
        try {
            await hre.run("verify:verify", {
                address: result.address,
                constructorArguments: result.args,
            });
            console.log("Contract is Verified");
        } catch (error: any) {
            console.log("Failed in plugin", error.pluginName);
            console.log("Error name", error.name);
            console.log("Error message", error.message);
        }
    }
};

export default func;
func.tags = ["Token"];
