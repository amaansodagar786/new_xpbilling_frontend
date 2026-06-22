import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

// Icon imports
import { BiLogOut, BiLayout, BiLogIn } from "react-icons/bi";
import { TbLayoutGridAdd, TbMessages, TbUsers, TbReportAnalytics, TbTrash } from "react-icons/tb";
import { LuCircleDot, LuFile } from "react-icons/lu";
import { PiBasket, PiLightbulbThin } from "react-icons/pi";
import { CiShoppingBasket } from "react-icons/ci";
import { HiOutlineHome } from "react-icons/hi";
import { BsBell } from "react-icons/bs";
import { GiHamburgerMenu } from "react-icons/gi";
import { RxCross1 } from "react-icons/rx";
import { FiUser } from "react-icons/fi";
import { MdDiscount } from "react-icons/md";
import { FaSearch, FaFileExcel, FaPlus } from "react-icons/fa";

import logo from "../../assets/logo/jass_logo_new.png";
import "./Navbar.scss";

const Navbar = ({
  children,
  onNavigation,
  isCollapsed = false,
  onToggleCollapse,
  pageDashboard = null
}) => {
  const [toggle, setToggle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync with parent's collapsed state
  useEffect(() => {
    console.log('Navbar: isCollapsed prop changed to:', isCollapsed);
    setToggle(isCollapsed);
  }, [isCollapsed]);

  // Handle internal toggle changes
  const handleToggle = (newToggleState) => {
    setToggle(newToggleState);
    if (onToggleCollapse) {
      onToggleCollapse(newToggleState);
    }
  };

  const handleHamburgerClick = () => {
    handleToggle(!toggle);
  };

  const handleCrossClick = () => {
    handleToggle(true);
  };

  const handleMenuIconHiddenClick = () => {
    handleToggle(false);
  };

  // ✅ CHECK AUTH USING COOKIE (NOT localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          credentials: 'include' // Sends cookie automatically
        });

        if (response.ok) {
          const data = await response.json();
          const permissions = data.user?.permissions || [];
          setUserPermissions(permissions);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setUserPermissions([]);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
        setUserPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  // ✅ UPDATED LOGOUT - Clear cookie via API
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: 'include' // Sends cookie for logout
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear state
    setIsLoggedIn(false);
    setUserPermissions([]);
    navigate("/login");
  };

  const getPageTitle = () => {
    const route = location.pathname;
    switch (route) {
      case '/customer':
        return 'Customer Dashboard';
      case '/inventory':
        return 'Inventory Management';
      case '/dashboard':
        return 'Dashboard';
      case '/admin':
        return 'Admin Dashboard';
      case '/defective':
        return 'Product Disposal Dashboard';
      case '/report':
        return 'Business Reports And Analytics';
      case '/':
        return 'Invoice Creation & Dashboard';
      default:
        return '';
    }
  };

  const pageTitle = getPageTitle();

  // Define all possible menu items with their required permissions
  const allMenuData = [
    { icon: <PiBasket />, title: "Invoice", path: "/", permission: "invoice" },
    { icon: <HiOutlineHome />, title: "Dashboard", path: "/dashboard", permission: "dashboard" },
    { icon: <TbUsers />, title: "Customer", path: "/customer", permission: "customer" },
    { icon: <TbUsers />, title: "Admin", path: "/admin", permission: "admin" },
    { icon: <MdDiscount />, title: "PromoCodes", path: "/promo", permission: "discount" },
    { icon: <MdDiscount />, title: "Packages", path: "/packages", permission: "packages" },
    { icon: <MdDiscount />, title: "Workshop", path: "/workshop", permission: "packages" },
    { icon: <BiLayout />, title: "Bottle Inventory", path: "/inventory/bottles", permission: "inventory" },
    { icon: <BiLayout />, title: "Xp Inventory", path: "/inventory/xp", permission: "inventory" },
    { icon: <BiLayout />, title: "Dispenser Inventory", path: "/inventory/dispenser", permission: "inventory" },
    { icon: <TbTrash />, title: "Product Disposal", path: "/defective", permission: "disposal" },
    { icon: <TbReportAnalytics />, title: "Report", path: "/report", permission: "report" },

  ];

  // Filter menu items based on user permissions
  const getFilteredMenu = () => {
    if (userPermissions.includes("admin")) {
      return allMenuData;
    }
    return allMenuData.filter(item => userPermissions.includes(item.permission));
  };

  const filteredMenuData = getFilteredMenu();

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div id="sidebar" className={toggle ? "hide" : ""}>
        <div className="logo">
          <div className="logoBox">
            {toggle ? (
              <GiHamburgerMenu
                className="menuIconHidden"
                onClick={handleMenuIconHiddenClick}
              />
            ) : (
              <>
                <img src={logo} alt="Logo" className="sidebar-logo" />
                <RxCross1
                  className="menuIconHidden"
                  onClick={handleCrossClick}
                />
              </>
            )}
          </div>
        </div>

        <ul className="side-menu top">
          {filteredMenuData.map(({ icon, title, path }, i) => (
            <li key={i}>
              <NavLink
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={(e) => {
                  if (onNavigation) {
                    e.preventDefault();
                    onNavigation(path);
                  }
                }}
              >
                <span className="menu-icon">{icon}</span>
                <span className="menu-title">{title}</span>
              </NavLink>
            </li>
          ))}

          {isLoggedIn && (
            <li className="logout-menu-item">
              <button className="sidebar-logout-btn" onClick={handleLogout}>
                <BiLogOut />
                <span>Logout</span>
              </button>
            </li>
          )}
        </ul>
      </div>

      <div id="content">
        <nav>
          <div className="nav-main">
            <GiHamburgerMenu
              className="menuIcon"
              onClick={handleHamburgerClick}
            />

            {/* Page-specific dashboard controls */}
            {pageTitle && (
              <div className="page-title">
                {pageTitle}
              </div>
            )}
          </div>

          <div>
            {!isLoggedIn ? (
              <button className="icon-button" onClick={handleLogin} title="Login">
                <BiLogIn />
              </button>
            ) : (
              <div className="profile">
                <div className="profile-icon" title="Account">
                  <FiUser />
                </div>
                <button className="icon-button" onClick={handleLogout} title="Logout">
                  <BiLogOut />
                </button>
              </div>
            )}
          </div>
        </nav>
        {children}
      </div>
    </>
  );
};

export default Navbar;