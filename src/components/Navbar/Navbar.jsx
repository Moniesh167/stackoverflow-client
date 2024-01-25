import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import decode from "jwt-decode";

import logo from "../../assets/logo.png";
import icon from "../../assets/icon.png"
import search from "../../assets/search-solid.svg";
import Avatar from "../../components/Avatar/Avatar";
import "./Navbar.css";
import { setCurrentUser } from "../../actions/currentUser";
import menuIcon from "../../assets/bars-solid.svg";
import { ref, serverTimestamp, set } from "firebase/database";
import { auth, database } from "../../firebase/firebase";
import { signOut } from "firebase/auth";
import { IoNotifications } from "react-icons/io5";

const Navbar = ({ handleisMobile,setIsNotificationOpen,notificationCount }) => {
  const dispatch = useDispatch();
  const User = useSelector((state) => state.currentUserReducer);
  const navigate = useNavigate();

  const handleLogout = () => {
    const uid = User?.result.fuid
    const userRef = ref(database, `/status/${uid}`)
    set(userRef, { isOnline: false, last_changed: serverTimestamp() }).then(() => {
      signOut(auth)
      dispatch({ type: "LOGOUT" });
      dispatch(setCurrentUser(null));
    }).catch(err => console.log(err));
    navigate("/");
  };

  useEffect(() => {
    const token = User?.token;
    if (token) {
      const decodedToken = decode(token);
      const currentTime = Date.now()
      const expirationTime = decodedToken.exp * 1000 - currentTime
      if (expirationTime > 0) {
        const logoutTimeout = setTimeout(() => {
          handleLogout()
        }, expirationTime);
        return (() => clearTimeout(logoutTimeout))
      }
      handleLogout()
    }

    dispatch(setCurrentUser(JSON.parse(localStorage.getItem("Profile"))));
    //eslint-disable-next-line
  }, [User?.token, dispatch]);

  return (
    <nav className="main-nav">
      <div className="navbar">
        <button className="menu-icon" onClick={() => handleisMobile()}>
          <img src={menuIcon} alt="bars" width="15" />
        </button>
        <div className="navbar-1">
          <Link to="/" className="nav-item nav-logo">
            <img id="stackoverflow-logo" src={logo} alt="logo" />
            <img id="stackoverflow-icon" src={icon} alt="icon" />
          </Link>
          <Link to="/" className="nav-item nav-btn res-nav">
            About
          </Link>
          <Link to="/" className="nav-item nav-btn res-nav">
            Products
          </Link>
          <Link to="/" className="nav-item nav-btn res-nav">
            For Teams
          </Link>
          <form id="search-box">
            <input type="text" placeholder="Search..." />
            <img src={search} alt="search" width="18" className="search-icon" />
          </form>
        </div>
        <div className="navbar-2">
          {User === null ? (
            <Link to="/Auth" id="login-button" className="nav-item nav-links">
              Log in
            </Link>
          ) : (
            <>
            <div style={{position:'relative'}}>
            <IoNotifications onClick={()=>setIsNotificationOpen(p=>!p)} style={{fontSize:'22px',marginRight:'5px',cursor:'pointer'}} />
            <p style={{position:'absolute',top:'-20px',left:'8px',backgroundColor:'red',padding:'1px 4px',borderRadius:'50%',textAlign:'center',fontSize:'12px'}}>{notificationCount?notificationCount:0}</p>
            </div>
              <Avatar
                backgroundColor="#009dff"
                px="10px"
                py="7px"
                borderRadius="50%"
                color="white"
                width={'16px'}
              >
                <Link
                  to={`/Users/${User?.result?._id}`}
                  style={{ color: "white", textDecoration: "none" }}
                >
                  {User.result.name.charAt(0).toUpperCase()}
                </Link>
              </Avatar>
              <button className="nav-item nav-links" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
