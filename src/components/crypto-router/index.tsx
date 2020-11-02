import React from "react";
import "./style.css";
import { InputField } from "../input-field";
interface RouterProps {
  close: () => void;
}
export class CryptoRouter extends React.Component<any, RouterProps> {
  constructor(props: RouterProps) {
    super(props);
  }
  render() {
    return (
      <div className="router-wrap">
        <div className="header">
          <div className="header-text">ETH/QUAD</div>
          <a onClick={this.props.close} className="header-button">
            X
          </a>
        </div>
        <div>GET LPs</div>
        <div className="insert-coin">
          <div className="section">
            <InputField></InputField>
            <input type="submit" value="MAX" className="max-button"></input>
            <div className="subtext">Total in Wallet: 420</div>
            <a className="swap">SWAP FOR LPs</a>
          </div>
        </div>
        <div>STAKE</div>
        <div className="insert-coin">
          <div className="section">
            <InputField></InputField>
            <input type="submit" value="MAX" className="max-button"></input>
            <div className="subtext">Unstaked LPs in Wallet: 420</div>
            <a className="swap">STAKE LPs</a>
          </div>
        </div>
        <div> MY STAKED LP BALANCE</div>
        <div className="balance">1000 LP's</div>
        <div>UNSTAKE</div>
        <div className="insert-coin">
          <div className="section">
            <InputField></InputField>
            <input type="submit" value="MAX" className="max-button"></input>
            <div className="subtext">Unstaked LPs in Wallet: 420</div>
            <a className="swap">STAKE LPs</a>
          </div>
        </div>
      </div>
    );
  }
}
