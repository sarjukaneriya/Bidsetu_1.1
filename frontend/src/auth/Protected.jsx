import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { getValidToken } from "../utils/auth";

const useAuth = () => {
  const token = getValidToken();
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token) {
    localStorage.removeItem("user");
  }
  return token && user;
};

const PublicRoute = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  //console.log(auth, "auth.,,,,,,,,.......public....");

  useEffect(() => {
    if (auth) {
      navigate("/dashboard");
    }
  }, [auth, navigate]);

  return auth ? null : <Outlet />;
};


const AdminPublicRoute = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  //console.log(auth, "auth.,,,,,,,,.......public....");

  useEffect(() => {
    if (auth) {
      navigate("/admin/users");
    }
  }, [auth, navigate]);

  return auth ? null : <Outlet />;
};

const Protected = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  //console.log(auth, "auth.,,,,,,,,.......protected....");
  useEffect(() => {
    if (!auth) {
      navigate("/login");
    }
  }, [auth, navigate]);

  return auth ? <Outlet /> : null;
};

const AdminProtected = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  //console.log(auth, "auth.,,,,,,,,.......protected....");
  useEffect(() => {
    if (!auth) {
      navigate("/admin/login");
    }
  }, [auth, navigate]);

  return auth ? <Outlet /> : null;
};

const BuyerRoutes=()=>{
  const {user}=useSelector((state)=>state.auth);
  const auth = useAuth();
  const navigate = useNavigate();
//console.log(auth, "auth.,,,,,buyer routes,,,...........");
  useEffect(() => {
    if (auth && user.userType !== "user") {
      navigate("/dashboard");
    }
  }, [auth, navigate]);

  return auth && user.userType === "user" ? <Outlet /> : null;
}

const SellerRoutes=()=>{
const {user}=useSelector((state)=>state.auth);
  const auth = useAuth();
  const navigate = useNavigate();
//console.log(auth, "auth.,,,,,seller routes,,,...........");
  useEffect(() => {
    if (auth && user.userType !== "seller") {
      navigate("/dashboard");
    }
  }, [auth, navigate]);

  return auth && user.userType === "seller" ? <Outlet /> : null;
}

const AdminRoutes=()=>{
  const {user}=useSelector((state)=>state.auth);
    const auth = useAuth();
    const navigate = useNavigate();
  //console.log(auth, "auth.,,,,,seller routes,,,...........");
  if (auth && user.userType !== "admin") {
    navigate("/dashboard");
  }
    useEffect(() => {
      if (auth && user.userType !== "admin") {
        navigate("/dashboard");
      }
    }, [auth, navigate]);
  
    return auth && user.userType === "admin" ? <Outlet /> : null;
  }

export { PublicRoute,SellerRoutes, BuyerRoutes, AdminRoutes,AdminProtected , AdminPublicRoute};
export default Protected;
