import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoadingIndicator from "./components/LoadingIndicator";

const ProtectedRoute = ({ children }) => {
const { user, loading } = useAuth();
const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      // alert("Sign in required!");
      setRedirect(true); // Trigger navigation after showing the alert
    }
  }, [loading, user]);

  if (loading) return <div className="ml-[50%]"><LoadingIndicator /></div>;

  if (redirect) {
    return <Navigate to="/sign-in" />;
  }

  return user ? children : null;
};

export default ProtectedRoute;
