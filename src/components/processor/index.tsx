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
  chosenRouter: string;
}

export const Processor = (props: any) => {
  const { active } = useWeb3React<Web3>();
  const { loading: loadingAddresses, data: addresses } = useFetchWLPAddresses();
  const [state, setState] = useState<ProcessorState>({
    showRouter: false,
    chosenRouter: "",
  });

  const { showRouter, chosenRouter } = state;

  const openRouter = (router: string) => {
    setState({
      showRouter: true,
      chosenRouter: router,
    });
  };
  const closeRouter = () => {
    setState({
      showRouter: false,
      chosenRouter: "",
    });
  };

  return (
    <div className="wrap">
      <div className="processor-riser">
        {active ? (
          showRouter ? (
            <CryptoRouter
              close={closeRouter}
              tokenAddress={chosenRouter}
            ></CryptoRouter>
          ) : !loadingAddresses && addresses ? (
            <div className="box-wrap">
              {addresses.map((a) => (
                <Core open={() => openRouter(a)}></Core>
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
