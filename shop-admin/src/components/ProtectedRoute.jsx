import React from 'react';
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ user, isAdmin, children }) {
  const location = useLocation();
  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}