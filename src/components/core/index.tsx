import React from "react";
import "./style.css";
import { Button } from "../button";
export class Core extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (
      <div className="box">
        <div className="box-inner">
          <Button></Button>
        </div>
      </div>
    );
  }
}
