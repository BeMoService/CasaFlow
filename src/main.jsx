// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx"; // <-- expliciet .jsx om resolutie-gedoe te vermijden
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state={err:null}; }
  static getDerivedStateFromError(error){ return { err: error }; }
  componentDidCatch(error, info){ console.error(error, info); }
  render(){
    if (this.state.err) {
      return <div style={{padding:16}}>
        <h2>App failed to load</h2>
        <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.err)}</pre>
      </div>;
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root niet gevonden in index.html");

ReactDOM.createRoot(rootEl).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);
