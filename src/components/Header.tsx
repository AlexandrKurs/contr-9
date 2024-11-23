import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const goToHome = () => navigate('/');
  const goToCategories = () => navigate('/categories');

  return (
    <div className="d-flex justify-content-between align-items-center p-3 bg-light">
      <h1 style={{ cursor: 'pointer' }} onClick={goToHome}>
        Finance tracker
      </h1>
      <div>
        <button onClick={goToCategories} className="btn btn-primary me-2">
          Categories
        </button>
        <button className="btn btn-secondary">
          Add
        </button>
      </div>
    </div>
  );
};

export default Header;
