import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";
import Team from "./pages/Team";
import Mission from "./pages/Mission";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CanvasBackground from "./components/CanvasBackground";

function App() {
  return (
    <>
      <CanvasBackground />
      <Router>
        <Routes>
          <Route path="/team" element={<Team />} />
          <Route path="/" element={<Home />} />
          <Route path="/mission" element={<Mission />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;