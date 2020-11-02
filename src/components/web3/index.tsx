import React from "react";
import Web3 from "web3";
import { provider } from "web3-core";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

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
  const { account, activate, active } = useWeb3React();

  //Typescript doesn't expect window.ethereum to be a thing. Just ignore it.
  //@ts-ignore
  if (!window.ethereum)
    //No metamask installed. To be handled properly.
    return <div>Please install metamask</div>;

  const onClick = () => {
    activate(injectedConnector);
  };

  return (
    <div>
      {active ? (
        <div>
          {
            //do something when metamask is connected
            account
          }
        </div>
      ) : (
        <button type="button" onClick={onClick}>
          Connect with metamask
        </button>
      )}
    </div>
  );
};
