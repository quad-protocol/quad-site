import React from "react";
import Web3 from "web3";
import "./style.css";
import { provider } from "web3-core";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import metamask_logo from "../../images/metamask_logo.png";

const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    42, // Kovan
  ],
});

export const getLibrary = (provider: provider) => {
  return new Web3(provider);
};

export const ChainIntegration = () => {
  const { activate, active } = useWeb3React();

  //Typescript doesn't expect window.ethereum to be a thing. Just ignore it.

  const onClick = () => {
    activate(injectedConnector);
  };

  return (
    <div className="connect-wrap">
      <img src={metamask_logo} className="metamask-logo" />
      {
        //@ts-ignore
        window.ethereum ? (
          active ? (
            "Connecting..."
          ) : (
            <a className="connect" onClick={onClick}>
              Connect to metamask
            </a>
          )
        ) : (
          <div className="no-metamask">Please install metamask</div>
        )
      }
    </div>
  );
};
