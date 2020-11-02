import React from "react";
import "./style.css";
import { Core } from "../core";
import { CryptoRouter } from "../crypto-router";

interface ProcessorState {
  showRouter: boolean;
  chosenRouter: string;
}

export class Processor extends React.Component<any, ProcessorState> {
  constructor(props: any) {
    super(props);
    this.state = { showRouter: false, chosenRouter: "ETH" };
  }

  openRouter() {
    this.setState({ showRouter: true });
  }
  closeRouter() {
    this.setState({ showRouter: false });
  }
  render() {
    const { showRouter } = this.state;
    return (
      <div className="wrap">
        <div className="processor-riser">
          {showRouter && (
            <CryptoRouter close={this.closeRouter.bind(this)}></CryptoRouter>
          )}
          {!showRouter && (
            <div className="box-wrap">
              <Core open={this.openRouter.bind(this)}></Core>
              <Core></Core>
              <Core></Core>
              <Core></Core>
            </div>
          )}
        </div>
      </div>
    );
  }
}
