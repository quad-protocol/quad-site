import React from "react";
import { QuadQuery } from "../../quad-libs/quad-lib";

export class BoilerPlate extends React.Component<any, { query: QuadQuery }> {
  constructor(props: any) {
    super(props);
    const query = new QuadQuery();
    this.state = { query };
  }
}
