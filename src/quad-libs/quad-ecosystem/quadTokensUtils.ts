import Web3 from "web3";
import { TransactionReceipt } from "web3-core";
import { Contract } from "web3-eth-contract";
import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES, useRole, useSingletonRole, ABIS } from "./quadResolver";
import { GenericLoadingHook, usePeriodicCall } from "./reactUtils";
import BN from "bn.js";

const TOKEN_ROLE = ROLES["TOKEN"];
const WLP_ROLE = ROLES["WLP"];
const LP_ROLE = ROLES["LP"];

export const useFetchWLPByName = (
  name: string
): GenericLoadingHook<Contract> => {
  const { loading, data: contracts } = useRole(WLP_ROLE);

  const [state, setState] = useState<NamedFetchHook>({
    name: name,
    loading: true,
    data: null,
  });

  useEffect(() => {
    if (!loading && contracts) {
      const findName = async () => {
        for (const contract of contracts) {
          const n = await contract.methods.name();

          if (n === name) return contract;
        }
        return null;
      };
      findName().then((contract) =>
        setState({
          name: name,
          loading: false,
          data: contract,
        })
      );
    }
  }, [name, loading, contracts]);

  return { loading: state.loading, data: state.data };
};

export const useFetchLPByWLPName = (
  name: string
): GenericLoadingHook<Contract> => {
  const { loading: lpLoading, data: contracts } = useRole(LP_ROLE);
  const { loading, data: contract } = useFetchWLPByName(name);

  const [state, setState] = useState<NamedFetchHook>({
    name: name,
    loading: true,
    data: null,
  });

  useEffect(() => {
    if (!loading && !lpLoading) {
      if (!contract || !contracts)
        setState({
          name: name,
          loading: false,
          data: null,
        });
      else
        contract.methods
          ._lpToken()
          .call()
          .then((address: string) => {
            const filtered = contracts.filter(
              (c) => c.options.address === address
            );
            if (filtered.length === 0)
              setState({
                name: name,
                loading: false,
                data: null,
              });
            else
              setState({
                name: name,
                loading: false,
                data: filtered[0],
              });
          });
    }
  }, [loading, lpLoading, contracts, contract, name]);

  return { loading: state.loading, data: state.data };
};

export const useFetchQuadBalance = (): GenericLoadingHook<string> => {
  const { account, library, active } = useWeb3React<Web3>();
  const { loading, data: contract } = useSingletonRole(TOKEN_ROLE);

  const [state, setState] = useState<AddressFetchHook>({
    account: account as string,
    loading: true,
    data: null,
  });

  const updateBalanceState = useCallback(() => {
    if (loading || !active || !contract || !account || !library) return;

    contract.methods.balanceOf(account).then((balance: BN) => {
      setState({
        account: account,
        loading: false,
        data: library.utils.fromWei(balance, "ether"),
      });
    });
  }, [active, loading, library, account, contract]);

  usePeriodicCall(updateBalanceState, 30000);

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

    contract.methods.totalSupply().then((totalSupply: BN) => {
      setState({
        loading: false,
        data: library.utils.fromWei(totalSupply, "ether"),
      });
    });
  });

  return state;
};

export const useFetchWLPBalances = (
  account: string | null
): GenericLoadingHook<{ [x: string]: string }> => {
  const { loading, data: contracts } = useRole(WLP_ROLE);

  const result = useFetchMultipleTokenBalances(contracts, account);

  return { loading: loading || result.loading, data: result.data };
};

export const useFetchLPBalances = (
  account: string | null
): GenericLoadingHook<{ [x: string]: string }> => {
  const { loading, data: contracts } = useRole(LP_ROLE);

  const result = useFetchMultipleTokenBalances(contracts, account);

  return { loading: loading || result.loading, data: result.data };
};

const useFetchMultipleTokenBalances = (
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
};

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

interface NamedFetchHook extends GenericLoadingHook<Contract> {
  name: string;
}

interface AddressFetchHook extends GenericLoadingHook<string> {
  account: string;
}

interface MultiBalanceFetchHook
  extends GenericLoadingHook<{ [x: string]: string }> {
  account: string | null;
  contracts: Contract[] | null;
}
