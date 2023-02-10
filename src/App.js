import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "./index.css";
import Header from "components/Header";
import Home from "pages/Home";
import Simulation from "pages/Simulation";
import Footer from "components/Footer";

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/simulations/:simulationId" element={<Simulation />} />
        </Routes>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
