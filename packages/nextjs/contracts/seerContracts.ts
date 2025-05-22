import { Abi } from "viem";
import RouterJson from "~~/contracts/abis/GnosisRouter.json";
import MarketFactoryJson from "~~/contracts/abis/MarketFactory.json";
import MarketViewJson from "~~/contracts/abis/MarketView.json";
import RealityProxyJson from "~~/contracts/abis/RealityProxy.json";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const seerContracts = {
  100: {
    MarketFactory: {
      address: "0x83183DA839Ce8228E31Ae41222EaD9EDBb5cDcf1",
      abi: MarketFactoryJson.abi as Abi,
    },
    Router: {
      address: "0xeC9048b59b3467415b1a38F63416407eA0c70fB8",
      abi: RouterJson.abi as Abi,
    },
    MarketView: {
      address: "0x995dC9c89B6605a1E8cc028B37cb8e568e27626f",
      abi: MarketViewJson.abi as Abi,
    },
    RealityProxy: {
      address: "0xc260ADfAC11f97c001dC143d2a4F45b98e0f2D6C",
      abi: RealityProxyJson.abi as Abi,
    },
  },
} as const;

export default seerContracts satisfies GenericContractsDeclaration;
