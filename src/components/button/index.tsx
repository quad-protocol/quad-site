import React from "react";
import "./style.css";
export class Button extends React.Component<any, { click: () => void }> {
  constructor(props: any) {
    super(props);
  }
  render() {
    const { click } = this.props;
    return (
      <a onClick={click} className="button">
        {" "}
        Open{" "}
      </a>
    );
  }
}
