import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../store/authReducer";

export const PrivateRouteHome = () => {
  const currentUser = useSelector(selectCurrentUser);

  let auth = { token: currentUser ? true : false };
  return auth.token ? <Outlet /> : <Navigate to="/" />;
};
