import React from "react";
import "./App.css";
import { ChainIntegration } from "./components/web3";
import { Processor } from "./components/processor";

function App() {
  return (
    <div className="App">
      <ChainIntegration></ChainIntegration>
      <Processor></Processor>
    </div>
  );
}

export default App;
