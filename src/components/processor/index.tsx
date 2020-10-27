import React from "react";
import "./style.css";
import { Core } from "../core";
export class Processor extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (
      <div className="wrap">
        <div className="processor-riser">
          <div className="box-wrap">
            <Core></Core>
            <Core></Core>
            <Core></Core>
            <Core></Core>
          </div>
        </div>
      </div>
    );
  }
}
