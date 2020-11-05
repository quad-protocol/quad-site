import React from "react";
import Web3 from "web3";
import "./style.css";
import { InputField } from "../input-field";
import {
  useFetchBackingLP,
  useFetchBackingTokens,
  useFetchETHBalance,
  useFetchTokenBalance,
  useFetchTokenName,
} from "../../quad-libs/quad-ecosystem/quadTokensUtils";
import { useWeb3React } from "@web3-react/core";
import { useFetchUserData } from "../../quad-libs/quad-ecosystem/quadVault";

interface RouterProps {
  close: () => void;
  tokenAddress: string;
}

export const CryptoRouter = (props: RouterProps) => {
  const { active } = useWeb3React<Web3>();
  const { data: lpAddress } = useFetchBackingLP(props.tokenAddress);
  const { data: tokens } = useFetchBackingTokens(lpAddress);
  const { loading: token0Loading, data: token0Name } = useFetchTokenName(
    tokens?.token0 ? tokens.token0 : null
  );
  const { loading: token1Loading, data: token1Name } = useFetchTokenName(
    tokens?.token1 ? tokens.token1 : null
  );
  const { loading: ethBalanceLoading, data: ethBalance } = useFetchETHBalance();
  const { loading: lpBalanceLoading, data: lpBalance } = useFetchTokenBalance(
    props.tokenAddress
  );
  const { loading: vaultDataLoading, data: vaultData } = useFetchUserData(
    props.tokenAddress
  );

  return (
    <div className="router-wrap">
      <div className="header">
        <div className="header-text">
          {token0Loading && token1Loading
            ? "Loading..."
            : token0Name + "/" + token1Name}
        </div>
        <a onClick={props.close} className="header-button">
          X
        </a>
      </div>
      <div>GET LPs</div>
      <div className="insert-coin">
        <div className="section">
          <InputField></InputField>
          <input type="submit" value="MAX" className="max-button"></input>
          <div className="subtext">
            {active
              ? ethBalanceLoading
                ? "Total in wallet: Loading..."
                : "Total in wallet: " + ethBalance
              : "Please connect to metamask"}
          </div>
          <a className="swap">SWAP FOR W.LPs</a>
        </div>
      </div>
      <div>STAKE</div>
      <div className="insert-coin">
        <div className="section">
          <InputField></InputField>
          <input type="submit" value="MAX" className="max-button"></input>
          <div className="subtext">
            {active
              ? lpBalanceLoading
                ? "Unstaked W.LPs in wallet: Loading..."
                : "Unstaked W.LPs in wallet: " + lpBalance
              : "Please connect to metamask"}
          </div>
          <a className="swap">STAKE W.LPs</a>
        </div>
      </div>
      {/*<div> MY STAKED LP BALANCE</div>
      <div className="balance">1000 LP's</div>*/}
      <div>UNSTAKE</div>
      <div className="insert-coin">
        <div className="section">
          <InputField></InputField>
          <input type="submit" value="MAX" className="max-button"></input>
          <div className="subtext">
            {active
              ? vaultDataLoading
                ? "Staked W.LPs: Loading..."
                : "Staked W.LPs: " + vaultData?.stakedAmount
              : "Please connect to metamask"}
          </div>
          <a className="swap">UNSTAKE W.LPs</a>
        </div>
      </div>
    </div>
  );
};
