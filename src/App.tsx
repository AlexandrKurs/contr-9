import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Categories from './components/Categories';
import Home from './components/Home';

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
