import React, { useState } from "react";
import "./style.css";
import Web3 from "web3";
import { Core } from "../core";
import { CryptoRouter } from "../crypto-router";
import { useFetchWLPAddresses } from "../../quad-libs/quad-ecosystem/quadTokensUtils";
import { useWeb3React } from "@web3-react/core";
import { ChainIntegration } from "../web3";

interface ProcessorState {
  showRouter: boolean;
  tokenAddress: string;
  tokenName: string;
}

export const Processor = (props: any) => {
  const { active } = useWeb3React<Web3>();
  const { loading: loadingAddresses, data: addresses } = useFetchWLPAddresses();
  const [state, setState] = useState<ProcessorState>({
    showRouter: false,
    tokenAddress: "",
    tokenName: "",
  });

  const { showRouter, tokenAddress, tokenName } = state;

  const openRouter = (tokenAddress: string, tokenName: string) => {
    setState({
      showRouter: true,
      tokenAddress: tokenAddress,
      tokenName: tokenName,
    });
  };
  const closeRouter = () => {
    setState({
      showRouter: false,
      tokenAddress: "",
      tokenName: "",
    });
  };

  return (
    <div className="wrap">
      <div className="processor-riser">
        {active ? (
          showRouter ? (
            <CryptoRouter
              close={closeRouter}
              tokenAddress={tokenAddress}
              tokenName={tokenName}
            ></CryptoRouter>
          ) : !loadingAddresses && addresses ? (
            <div className="box-wrap">
              {addresses.map((a) => (
                <Core open={openRouter} tokenAddress={a}></Core>
              ))}
            </div>
          ) : (
            "Loading..."
          )
        ) : (
          <ChainIntegration></ChainIntegration>
        )}
      </div>
    </div>
  );
};
