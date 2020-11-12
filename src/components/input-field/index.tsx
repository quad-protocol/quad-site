import React from "react";
import "./style.css";

export class InputField extends React.PureComponent<
  {
    value: string;
    updateNumber: (event: React.ChangeEvent<HTMLInputElement>) => void;
  },
  any
> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { updateNumber, value } = this.props;
    return (
      <div className="placeholder" data-placeholder="ETH">
        <input
          value={value}
          pattern="^\d*\.?\d*$"
          onChange={(event) => updateNumber(event)}
        />
      </div>
    );
  }
}
