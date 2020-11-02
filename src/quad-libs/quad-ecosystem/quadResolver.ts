import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { useWeb3React } from "@web3-react/core";
import { useMemo, useState } from "react";
import { GenericLoadingHook } from "./reactUtils";

const discoveryAddress: string = "";

export const ROLES = {
  LGE: Web3.utils.soliditySha3("LGE_ROLE") as string,
  VAULT: Web3.utils.soliditySha3("QUAD_VAULT_ROLE") as string,
  TOKEN: Web3.utils.soliditySha3("QUAD_TOKEN_ROLE") as string,
  WLP: Web3.utils.soliditySha3("WRAPPED_LP_ROLE") as string,
  LP: Web3.utils.soliditySha3("LP_TOKEN_ROLE") as string,
};

export const useContract = (
  address: string | null,
  abi: AbiItem | AbiItem[]
): Contract | null => {
  const { library } = useWeb3React<Web3>();

  return useMemo(() => {
    if (!address || !abi || !library) return null;

    return new library.eth.Contract(abi, address);
  }, [address, abi, library]);
};

export const useContracts = (
  addresses: string[] | null,
  abi: AbiItem | AbiItem[]
): Contract[] | null => {
  const { library } = useWeb3React<Web3>();

  return useMemo(() => {
    if (!addresses || addresses.length === 0 || !abi || !library) return null;

    const contracts: Contract[] = [];
    for (let address of addresses)
      contracts.push(new library.eth.Contract(abi, address));

    return contracts;
  }, [addresses, abi, library]);
};

export const useRole = (role: string): GenericLoadingHook<Contract[]> => {
  const discoveryContract = useContract(discoveryAddress, discoveryABI);

  const [state, setState] = useState<RoleState>({
    role: role,
    loading: true,
    data: null,
  });

  useMemo(() => {
    if (discoveryContract != null)
      discoveryContract.methods
        .getRoleMembers(role)
        .call()
        .then((fetchedAddresses: string[]) => {
          //Trigger only 1 render instead of 2
          setState({
            role: role,
            loading: false,
            data: fetchedAddresses,
          });
        });
  }, [role, discoveryContract]);

  const ABI = ABIS[role];
  const contracts = useContracts(state.data, ABI);

  return { data: contracts, loading: state.loading };
};

export const useSingletonRole = (
  role: string
): GenericLoadingHook<Contract> => {
  const { data, loading } = useRole(role);

  if (loading || !data) return { data: null, loading: loading };

  return { data: data[0], loading: loading };
};

interface RoleState extends GenericLoadingHook<string[]> {
  role: string;
}

const discoveryABI = JSON.parse("");

export const ABIS: { [x: string]: any } = {
  [ROLES["LGE"]]: JSON.parse(""),
  [ROLES["VAULT"]]: JSON.parse(""),
  [ROLES["TOKEN"]]: JSON.parse(""),
  [ROLES["WLP"]]: JSON.parse(""),
  [ROLES["LP"]]: JSON.parse(""),
};
