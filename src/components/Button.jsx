import React from 'react';

const Button = ({ children, onClick }) => {
  return (
    <button 
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
