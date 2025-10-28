import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import PropertyView from "./pages/PropertyView.jsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/property/:id" element={<PropertyView />} />
      </Routes>
    </HashRouter>
  );
}
