import Web3 from "web3";
import { TransactionReceipt } from "web3-core";
import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES, useSingletonRole } from "./quadResolver";
import { GenericLoadingHook } from "./interfaces";
import BN from "bn.js";
//import { useFetchWLPBalances } from "./quadTokensUtils";

const VAULT_ROLE = ROLES["VAULT"];

export const useFetchUserData = (
  tokenAddress: string
): GenericLoadingHook<VaultUserData> => {
  const { account, active, library } = useWeb3React<Web3>();
  const { loading, data: contract } = useSingletonRole(VAULT_ROLE);

  const [state, setState] = useState<VaultFetcherHookState>({
    address: tokenAddress,
    account: account as string,
    loading: true,
    data: null,
  });

  useEffect(() => {
    if (loading || !active || !contract || !library || !account) return;

    contract.methods
      .getUserData(tokenAddress, account)
      .call()
      .then((rawData: VaultUserDataRaw) => {
        const data: VaultUserData = {
          stakedAmount: library.utils.fromWei(rawData.stakedAmount, "ether"),
          paidAmount: library.utils.fromWei(rawData.paidAmount, "ether"),
          pendingRewards: library.utils.fromWei(
            rawData.pendingRewards,
            "ether"
          ),
          lockedTokens: library.utils.fromWei(rawData.lockedTokens, "ether"),
        };
        setState({
          address: tokenAddress,
          account: account,
          loading: false,
          data: data,
        });
      });
  }, [account, active, tokenAddress, loading, library, contract]);

  //usePeriodicCall(updateStakedBalanceState, 30000);

  return { loading: state.loading, data: state.data };
};

/*export const useFetchTotalStakedTokens = (): GenericLoadingHook<{
  [x: string]: string;
}> => {
  const { loading, data: contract } = useSingletonRole(VAULT_ROLE);

  const { loading: balancesLoading, data: balances } = useFetchWLPBalances(
    !loading && contract ? contract.options.address : null
  );

  return { loading: balancesLoading && loading, data: balances };
};
*/
export const useFetchFeeCurrentAnalyticIndex = (): GenericLoadingHook<
  number
> => {
  const { loading, data: contract } = useSingletonRole(VAULT_ROLE);

  const [state, setState] = useState<GenericLoadingHook<number>>({
    loading: true,
    data: null,
  });

  useEffect(() => {
    if (loading || !contract) return;

    contract.methods
      .currentAnalyticIndex()
      .call()
      .then((index: BN) => {
        setState({
          loading: true,
          data: index.toNumber(),
        });
      });
  }, [loading, contract]);

  return state;
};

export const useFetchMultipleAnalytics = (
  startIndex: number,
  endIndex: number
): GenericLoadingHook<FeeAnalytic> => {
  const { active, library } = useWeb3React<Web3>();
  const { loading, data: contract } = useSingletonRole(VAULT_ROLE);

  const [state, setState] = useState<FeeAnalyticFetcherState>({
    loading: true,
    data: null,
    startIndex: startIndex,
    endIndex: endIndex,
  });

  useEffect(() => {
    if (loading || !active || !contract || !library) return;

    contract.methods
      .getMultipleAnalytics(startIndex, endIndex)
      .call()
      .then((analyticRaw: FeeAnalyticRaw) => {
        const analytic: FeeAnalytic = {
          startBlock: analyticRaw.startBlock.toNumber(),
          endBlock: analyticRaw.endBlock.toNumber(),
          feeAmount: library.utils.fromWei(analyticRaw.feeAmount, "ether"),
        };
        setState({
          loading: false,
          data: analytic,
          startIndex: startIndex,
          endIndex: endIndex,
        });
      });
  }, [loading, active, contract, library, startIndex, endIndex]);

  return { loading: state.loading, data: state.data };
};

export const useClaim = (): GenericLoadingHook<
  (tokenAddress: string) => Promise<TransactionReceipt>
> => {
  const { library, account, active } = useWeb3React<Web3>();
  const { loading, data: contract } = useSingletonRole(VAULT_ROLE);

  const claim = useMemo(() => {
    if (!active || loading || !contract || !library || !account) return null;
    return (tokenAddress: string): Promise<any> => {
      let encodedABI = contract.methods.withdraw(tokenAddress, 0).encodeABI();

      return library.eth.sendTransaction({
        from: account,
        to: contract.options.address,
        data: encodedABI,
      });
    };
  }, [library, contract, account, active, loading]);

  return { loading: !active || loading, data: claim };
};

export const useWithdraw = (): GenericLoadingHook<
  (tokenAddress: string, amount: number) => Promise<TransactionReceipt>
> => {
  const { library, account, active } = useWeb3React<Web3>();
  const { loading, data: contract } = useSingletonRole(VAULT_ROLE);

  const withdraw = useMemo(() => {
    if (!active || loading || !contract || !library || !account) return null;
    return (tokenAddress: string, amount: number) => {
      let encodedABI = contract.methods
        .withdraw(tokenAddress, library.utils.toWei(amount.toString(), "ether"))
        .encodeABI();

      return library.eth.sendTransaction({
        from: account,
        to: contract.options.address,
        data: encodedABI,
      });
    };
  }, [library, contract, account, active, loading]);

  return { loading: !active || loading, data: withdraw };
};

//assumes that the lp tokens are already approved
export const useWrapAndDeposit = (): GenericLoadingHook<
  (tokenAddress: string, ammount: number) => Promise<TransactionReceipt>
> => {
  const { library, account, active } = useWeb3React<Web3>();
  const { loading, data: contract } = useSingletonRole(VAULT_ROLE);

  const wrapAndDeposit = useMemo(() => {
    if (!active || loading || !contract || !account || !library) return null;
    return (tokenAddress: string, amount: number) => {
      let encodedABI = contract.methods
        .wrapAndDeposit(
          tokenAddress,
          library.utils.toWei(amount.toString(), "ether")
        )
        .encodeABI();

      return library.eth.sendTransaction({
        from: account,
        to: contract.options.address,
        data: encodedABI,
      });
    };
  }, [library, contract, account, active, loading]);

  return { loading: !active || loading, data: wrapAndDeposit };
};

//Assumes that wrapped lp tokens already approved. Approve function is in quadTokens.js
export const useDeposit = (): GenericLoadingHook<
  (tokenAddress: string, amount: number) => Promise<TransactionReceipt>
> => {
  const { library, account, active } = useWeb3React<Web3>();
  const { loading, data: contract } = useSingletonRole(VAULT_ROLE);

  const deposit = useMemo(() => {
    if (!active || loading || !contract || !account || !library) return null;
    return (tokenAddress: string, amount: number) => {
      let encodedABI = contract.methods
        .deposit(tokenAddress, library.utils.toWei(amount.toString(), "ether"))
        .encodeABI();

      return library.eth.sendTransaction({
        from: account,
        to: contract.options.address,
        data: encodedABI,
      });
    };
  }, [library, contract, account, active, loading]);

  return { loading: !active || loading, data: deposit };
};

export interface FeeAnalytic {
  startBlock: number;
  endBlock: number;
  feeAmount: string;
}

interface FeeAnalyticRaw {
  startBlock: BN;
  endBlock: BN;
  feeAmount: BN;
}

export interface VaultUserData {
  stakedAmount: string;
  pendingRewards: string;
  paidAmount: string;
  lockedTokens: string;
}

interface VaultUserDataRaw {
  stakedAmount: BN;
  pendingRewards: BN;
  paidAmount: BN;
  lockedTokens: BN;
}

interface FeeAnalyticFetcherState extends GenericLoadingHook<FeeAnalytic> {
  startIndex: number;
  endIndex: number;
}

interface VaultFetcherHookState extends GenericLoadingHook<VaultUserData> {
  address: string;
  account: string;
}
