import Web3 from "web3";
import { TransactionReceipt } from "web3-core";
import { Contract } from "web3-eth-contract";
import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ROLES,
  useRole,
  useSingletonRole,
  ABIS,
  useContract,
} from "./quadResolver";
import { GenericLoadingHook } from "./interfaces";
import BN from "bn.js";

const TOKEN_ROLE = ROLES["TOKEN"];
const WLP_ROLE = ROLES["WLP"];
const LP_ROLE = ROLES["LP"];

export const useFetchWLPAddresses = (): GenericLoadingHook<string[]> => {
  const { loading, data } = useRole(WLP_ROLE);

  if (loading || !data) return { loading: true, data: null };

  return { loading: false, data: data.map((c) => c.options.address) };
};

export const useFetchTokenName = (
  address: string | null
): GenericLoadingHook<string> => {
  const contract = useContract(address, ABIS[TOKEN_ROLE]);
  const [state, setState] = useState<AddressFetchHook>({
    loading: true,
    data: null,
    account: address,
  });

  useEffect(() => {
    if (!address || !contract) return;

    contract.methods
      .name()
      .call()
      .then((name: string) => {
        setState({
          loading: false,
          data: name,
          account: address,
        });
      });
  }, [contract, address]);

  return { loading: state.loading, data: state.data };
};

export const useFetchBackingLP = (
  address: string | null
): GenericLoadingHook<string> => {
  const contract = useContract(address, ABIS[WLP_ROLE]);
  const [state, setState] = useState<AddressFetchHook>({
    loading: true,
    data: null,
    account: address,
  });

  useEffect(() => {
    if (!address || !contract) return;

    contract.methods
      ._lpToken()
      .call()
      .then((lpAddress: string) => {
        setState({
          loading: false,
          data: lpAddress,
          account: address,
        });
      });
  }, [contract, address]);

  return { loading: state.loading, data: state.data };
};

export const useFetchBackingTokens = (
  address: string | null
): GenericLoadingHook<LPBackingTokens> => {
  const contract = useContract(address, ABIS[LP_ROLE]);
  const [state, setState] = useState<LPBackingFetcherHook>({
    loading: true,
    data: { token0: null, token1: null },
    address: address,
  });

  useEffect(() => {
    if (!address || !contract) return;

    contract.methods
      .token0()
      .call()
      .then((address: string) => {
        if (state.data?.token1)
          setState({
            loading: false,
            data: { token0: address, token1: state.data.token1 },
            address: address,
          });
        else
          setState({
            loading: true,
            data: { token0: address, token1: null },
            address: address,
          });
      });

    contract.methods
      .token1()
      .call()
      .then((address: string) => {
        if (state.data?.token0)
          setState({
            loading: false,
            data: { token0: state.data.token0, token1: address },
            address: address,
          });
        else
          setState({
            loading: true,
            data: { token0: null, token1: address },
            address: address,
          });
      });
  }, [contract, address]);

  return { loading: state.loading, data: state.data };
};

export const useFetchQuadBalance = (): GenericLoadingHook<string> => {
  const { loading: contractLoading, data: contract } = useSingletonRole(
    TOKEN_ROLE
  );

  const { loading: balanceLoading, data: balance } = useFetchTokenBalance(
    contract?.options.address as string | null
  );

  return { loading: contractLoading && balanceLoading, data: balance };
};

export const useFetchETHBalance = (): GenericLoadingHook<string> => {
  const { library, active, account } = useWeb3React<Web3>();

  const [state, setState] = useState<AddressFetchHook>({
    loading: true,
    data: null,
    account: account,
  });

  useEffect(() => {
    if (!active || !account || !library) return;

    library.eth.getBalance(account).then((balance: string) => {
      setState({
        loading: false,
        data: library.utils.fromWei(balance, "ether"),
        account: account,
      });
    });
  });

  return { loading: state.loading, data: state.data };
};

export const useFetchQuadTotalSupply = (): GenericLoadingHook<string> => {
  const { library, active } = useWeb3React<Web3>();
  const { loading, data: contract } = useSingletonRole(TOKEN_ROLE);

  const [state, setState] = useState<GenericLoadingHook<string>>({
    loading: true,
    data: null,
  });

  useEffect(() => {
    if (!active || !library || loading || !contract) return;

    contract.methods
      .totalSupply()
      .call()
      .then((totalSupply: BN) => {
        setState({
          loading: false,
          data: library.utils.fromWei(totalSupply, "ether"),
        });
      });
  });

  return state;
};

export const useFetchTokenBalance = (
  address: string | null
): GenericLoadingHook<string> => {
  const { active, library, account } = useWeb3React<Web3>();
  const contract = useContract(address, ABIS[TOKEN_ROLE]);

  const [state, setState] = useState<AddressFetchHook>({
    account: account,
    loading: true,
    data: null,
  });

  useEffect(() => {
    if (!active || !contract || !account || !library) return;

    contract.methods
      .balanceOf(account)
      .call()
      .then((balance: BN) => {
        setState({
          account: account,
          loading: false,
          data: library.utils.fromWei(balance, "ether"),
        });
      });
  }, [active, library, account, contract]);

  return { loading: state.loading, data: state.data };
};

//potentially useless, will remove later
/*const useFetchMultipleTokenBalances = (
  contracts: Contract[] | null,
  account: string | null
): GenericLoadingHook<{ [x: string]: string }> => {
  const { library, active } = useWeb3React<Web3>();
  const [state, setState] = useState<MultiBalanceFetchHook>({
    account: account,
    contracts: contracts,
    loading: true,
    data: null,
  });

  const updateBalanceState = useCallback(() => {
    if (!library || !active) return;

    if (contracts && account) {
      const getBalances = async () => {
        const balances: { [x: string]: string } = {};
        for (const contract of contracts) {
          const balance: BN = await contract.methods.balanceOf(account);
          balances[contract.options.address] = library.utils.fromWei(
            balance,
            "ether"
          );
        }

        return balances;
      };

      getBalances().then((balances) => {
        setState({
          account: account,
          contracts: contracts,
          loading: false,
          data: balances,
        });
      });
    } else
      setState({
        account: account,
        contracts: contracts,
        loading: false,
        data: null,
      });
  }, [contracts, account, library, active]);

  usePeriodicCall(updateBalanceState, 30000);

  return { loading: state.loading, data: state.data };
};*/

export const useApprove = (): GenericLoadingHook<
  (tokenAddress: string, spender: string) => Promise<TransactionReceipt>
> => {
  const { library, account, active } = useWeb3React();
  const ABI = ABIS["TOKEN"];

  const approve = useMemo(() => {
    if (!active) return null;
    //returns a promise
    return (tokenAddress: string, spender: string): Promise<any> => {
      const contract = new library.eth.Contract(ABI, tokenAddress);
      //Max approval
      let approvalAmount = library.utils
        .toBN(2)
        .pow(library.utils.toBN(256))
        .sub(1);
      let encodedABI = contract.methods
        .approve(spender, library.utils.toHex(approvalAmount))
        .encodeABI();

      return library.eth.sendTransaction({
        from: account,
        to: tokenAddress,
        data: encodedABI,
      });
    };
  }, [library, account, active, ABI]);

  return { loading: !active, data: approve };
};

interface AddressFetchHook extends GenericLoadingHook<string> {
  account: string | null | undefined;
}

interface LPBackingTokens {
  token0: string | null;
  token1: string | null;
}

interface LPBackingFetcherHook extends GenericLoadingHook<LPBackingTokens> {
  address: string | null | undefined;
}

/*interface MultiBalanceFetchHook
  extends GenericLoadingHook<{ [x: string]: string }> {
  account: string | null;
  contracts: Contract[] | null;
}*/
