import React from 'react';
import { NavLink } from 'react-router-dom';

// A helper component for the category links
export default function CategoryPill({ to, name, active }) {
  const baseClasses = "block px-4 py-2 rounded-lg transition";
  const activeClasses = "bg-teal-100 text-teal-700 font-semibold";
  const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  
  return (
    <NavLink 
      to={to} 
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      {name}
    </NavLink>
  );
}

