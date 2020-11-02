import React from "react";
import "./style.css";
import { Button } from "../button";
interface CoreProps {
  open: () => void;
}
export class Core extends React.Component<any, CoreProps> {
  constructor(props: CoreProps) {
    super(props);
  }
  render() {
    const { open } = this.props;
    return (
      <div className="box">
        <div className="box-inner">
          <Button click={open}></Button>
        </div>
      </div>
    );
  }
}
