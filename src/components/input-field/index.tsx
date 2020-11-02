import React from "react";
import "./style.css";

export class InputField extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (
      <div className="placeholder" data-placeholder="ETH">
        <input type="number" />
      </div>
    );
  }
}
