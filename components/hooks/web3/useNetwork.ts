import { CryptoHookFactory } from "@_types/hooks";
import useSWR from "swr";

const NETWORKS: {[k: string]: string} = {
    1337: "Ganache Network",
    1001:"Klaytn Testnet Baobab",


  
}

const targetId = process.env.NEXT_PUBLIC_TARGET_CHAIN_ID as string;
const targetNetwork = NETWORKS[targetId];


type UseNetworkResponse = {
  isLoading: boolean;
  isSupported: boolean;
  targetNetwork: string;
  isConnectedToNetwork: boolean;
}

type NetworkHookFactory = CryptoHookFactory<string, UseNetworkResponse>

export type UseNetworkHook = ReturnType<NetworkHookFactory>

export const hookFactory: NetworkHookFactory = ({provider, isLoading}) => () => {
  const {data, isValidating, ...swr} = useSWR(
    provider ? "web3/useNetwork" : null,
    async () => {
      const chainId = (await provider!.getNetwork()).chainId;

      if (!chainId) {
        throw "Cannot retreive network. Please, refresh browser or connect to other one."
      }

      return NETWORKS[chainId];
    }, {
      revalidateOnFocus: false
    }
  )

  const isSupported = data === targetNetwork;

  return {
    ...swr,
    data,
    isValidating,
    targetNetwork,
    isSupported,
    isConnectedToNetwork: !isLoading && isSupported,
    isLoading: isLoading as boolean,
  };
}