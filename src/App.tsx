import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/toolbar/Header.tsx";
import Categories from "./components/page/Categories.tsx";
import Home from "./components/page/Home.tsx";

const App: React.FC = () => {
  return (
    <Router>
      <div className="container w-50">
        <Header />
        <div className="mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
