import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import { PrivateRouteHome } from "./components/PrivateRoutes";

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/SignUp" element={<SignUp />} />
      <Route element={<PrivateRouteHome />}>
        <Route path="/home" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
