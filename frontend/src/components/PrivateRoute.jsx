import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  // Only allow access if a token exists in storage
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // No token → send to login
  // Has token → render the protected page
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;