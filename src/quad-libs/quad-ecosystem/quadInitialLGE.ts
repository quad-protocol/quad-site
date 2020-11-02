import Web3 from "web3";
import { TransactionReceipt } from "web3-core";
import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLES, useSingletonRole } from "./quadResolver";
import { GenericLoadingHook, usePeriodicCall } from "./reactUtils";
import BN from "bn.js";
import { useFetchQuadTotalSupply } from "./quadTokensUtils";
import { ETHPrice } from "../uniswap/uniswapDataFetcher";

const LGE_ROLE = ROLES["LGE"];

export const useFetchTotalContributedETH = (): GenericLoadingHook<string> => {
  const { loading, data: contract } = useSingletonRole(LGE_ROLE);
  const { account, active, library } = useWeb3React<Web3>();

  const [state, setState] = useState<AddressFetchHook>({
    account: account,
    loading: true,
    data: null,
  });

  const updateBalanceState = useCallback(() => {
    if (loading || !active || !contract || !library || !account) return;
    library.eth.getBalance(contract.options.address).then((balance) => {
      setState({
        account: account,
        loading: false,
        data: library.utils.fromWei(balance, "ether"),
      });
    });
  }, [contract, account, loading, active, library]);

  usePeriodicCall(updateBalanceState, 30000);

  return { loading: state.loading, data: state.data };
};

export const useFetchUserContributedETH = (): GenericLoadingHook<string> => {
  const { loading, data: contract } = useSingletonRole(LGE_ROLE);
  const { account, active, library } = useWeb3React<Web3>();

  const [state, setState] = useState<AddressFetchHook>({
    account: account,
    loading: true,
    data: null,
  });

  const updateContributionsState = useCallback(() => {
    if (loading || !active || !contract || !library || !account) return;
    contract.methods
      ._contributions(account)
      .call()
      .then((contributions: BN) => {
        setState({
          account: account,
          loading: false,
          data: library.utils.fromWei(contributions, "ether"),
        });
      });
  }, [contract, account, loading, active, library]);

  usePeriodicCall(updateContributionsState, 30000);

  return { loading: state.loading, data: state.data };
};

export const useFetchCurrentETHPerPool = (): GenericLoadingHook<string> => {
  const { loading, data } = useFetchTotalContributedETH();

  return useMemo(() => {
    if (loading || !data) return { loading: loading, data: data };

    return { loading: loading, data: (parseFloat(data) / 4).toString() };
  }, [loading, data]);
};

export const useFetchCurrentExpectedQuadPrice = (): GenericLoadingHook<
  string
> => {
  const {
    loading: ethPerPoolLoading,
    data: ethPerPool,
  } = useFetchCurrentETHPerPool();
  const {
    loading: totalSupplyLoading,
    data: totalSupply,
  } = useFetchQuadTotalSupply();
  const { loading: ethPriceLoading, data: ethPrice } = ETHPrice();

  return useMemo(() => {
    if (ethPerPoolLoading || totalSupplyLoading || ethPriceLoading)
      return { loading: true, data: null };

    if (!ethPerPool || !totalSupply || !ethPrice)
      return { loading: false, data: null };

    const quadPerPool = parseFloat(totalSupply) / 4;
    const quadPriceETH = quadPerPool / parseFloat(ethPerPool);

    return { loading: true, data: (quadPriceETH * ethPrice).toString() };
  }, [
    ethPerPoolLoading,
    ethPerPool,
    totalSupplyLoading,
    totalSupply,
    ethPriceLoading,
    ethPrice,
  ]);
};

export const useFetchEndTimestamp = (): GenericLoadingHook<string> => {
  const { loading, data: contract } = useSingletonRole(LGE_ROLE);

  const [state, setState] = useState<GenericLoadingHook<string>>({
    loading: true,
    data: null,
  });

  useEffect(() => {
    if (loading) return;

    if (contract)
      contract.methods
        ._endTimestamp()
        .call()
        .then((timestamp: BN) =>
          setState({
            loading: false,
            data: timestamp.toString(10),
          })
        );
    else
      setState({
        loading: false,
        data: null,
      });
  }, [loading, contract]);

  return state;
};

export const useFetchClaimableLPs = (
  tokenAddress: string | null | undefined
): GenericLoadingHook<string> => {
  const { account, library, active } = useWeb3React<Web3>();
  const { loading, data: contract } = useSingletonRole(LGE_ROLE);

  const [state, setState] = useState<TokenAmountFetchHook>({
    loading: true,
    data: null,
    account: account,
    token: tokenAddress,
  });

  useEffect(() => {
    if (!account || !active || !library || loading || !contract) return;

    contract.methods.getClaimableTokens().then((amount: BN) => {
      setState({
        loading: false,
        data: library.utils.fromWei(amount, "ether"),
        account: account,
        token: tokenAddress,
      });
    });
  }, [account, active, library, loading, contract, tokenAddress]);

  return { loading: state.loading, data: state.data };
};

export const useContribute = (): GenericLoadingHook<
  (ethAmount: number) => Promise<TransactionReceipt>
> => {
  const { loading, data: contract } = useSingletonRole(LGE_ROLE);
  const { account, library, active } = useWeb3React<Web3>();

  const contribute = useMemo(() => {
    if (loading || !active || !library || !contract || !account) return null;
    //returns a promise
    return (ethAmount: number) => {
      let weiAmount = library.utils.toWei(ethAmount.toString(), "ether");
      let encodedABI = contract.methods.contribute().encodeABI();

      return library.eth.sendTransaction({
        from: account,
        to: contract.options.address,
        data: encodedABI,
        value: library.utils.toHex(weiAmount),
      });
    };
  }, [loading, active, contract, library, account]);

  return { loading: loading || !active, data: contribute };
};

export const useClaimLPs = (): GenericLoadingHook<
  () => Promise<TransactionReceipt>
> => {
  const { loading, data: contract } = useSingletonRole(LGE_ROLE);
  const { account, library, active } = useWeb3React<Web3>();

  const claimLPs = useMemo(() => {
    if (loading || !active || !library || !contract || !account) return null;
    //returns a promise
    return () => {
      let encodedABI = contract.methods.claimTokens().encodeABI();

      return library.eth.sendTransaction({
        from: account,
        to: contract.options.address,
        data: encodedABI,
      });
    };
  }, [loading, active, contract, library, account]);

  return { loading: loading || !active, data: claimLPs };
};

interface AddressFetchHook extends GenericLoadingHook<string> {
  account: string | null | undefined;
}

interface TokenAmountFetchHook extends AddressFetchHook {
  token: string | null | undefined;
}
