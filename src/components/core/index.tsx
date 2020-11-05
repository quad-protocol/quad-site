import React from "react";
import "./style.css";
import { Button } from "../button";
import {
  useFetchBackingLP,
  useFetchBackingTokens,
  useFetchTokenSymbol,
} from "../../quad-libs/quad-ecosystem/quadTokensUtils";
interface CoreProps {
  open: (address: string, name: string) => void;
  tokenAddress: string;
}
export const Core = (props: CoreProps) => {
  const { open, tokenAddress } = props;
  const { data: lpAddress } = useFetchBackingLP(props.tokenAddress);
  const { data: tokens } = useFetchBackingTokens(lpAddress);
  const { loading: token0Loading, data: token0Name } = useFetchTokenSymbol(
    tokens?.token0 ?? null
  );
  const { loading: token1Loading, data: token1Name } = useFetchTokenSymbol(
    tokens?.token1 ?? null
  );

  let pairingToken = token0Name == "QUAD" ? token1Name : token0Name;

  if (pairingToken == "WETH") pairingToken = "ETH";

  return (
    <div className="box">
      {token0Loading && token1Loading ? (
        <div className="box-inner">Loading...</div>
      ) : (
        <div className="box-inner">
          {pairingToken}
          <Button click={() => open(tokenAddress, pairingToken ?? "")}></Button>
        </div>
      )}
    </div>
  );
};
