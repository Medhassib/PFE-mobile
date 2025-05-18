import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";

// Définir un type avec des children au lieu de component
interface PrivateRouteProps extends RouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, ...rest }) => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Route
      {...rest}
      render={() => (isAuthenticated ? children : <Redirect to="/login" />)}
    />
  );
};

export default PrivateRoute;
