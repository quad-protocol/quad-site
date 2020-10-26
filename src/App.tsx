import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BoilerPlate } from "./components/boiler-plate";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        Welcome to QUAD WORLD please enjoy your stay
          <div className="button-inner">
            Button Text
          </div>
      </header>
      <BoilerPlate></BoilerPlate>
    </div>
  );
}

export default App;
