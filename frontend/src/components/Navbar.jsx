import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaHome,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaLeaf
} from 'react-icons/fa';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);

  /* ---------------- Dashboard Route ---------------- */
  const dashboardLink = useMemo(() => {
    if (!user) return '/';

    const routes = {
      farmer: '/dashboard/farmer',
      consumer: '/dashboard/consumer',
      delivery_partner: '/dashboard/delivery',
      admin: '/dashboard/admin'
    };

    return routes[user.user_type] || '/';
  }, [user]);

  /* ---------------- Logout ---------------- */
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  /* ---------------- Close menus on route change ---------------- */
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* ---------------- Outside click close dropdown ---------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeClass = (path) =>
    location.pathname === path
      ? 'text-primary-600 font-semibold'
      : 'text-neutral-700 hover:text-primary-600';

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <FaLeaf className="text-green-600" />
            <span className="text-gradient">FreshFarm</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">

            <Link to="/" className={`flex items-center gap-2 ${activeClass('/')}`}>
              <FaHome /> Home
            </Link>

            <Link to="/products" className={activeClass('/products')}>
              Products
            </Link>

            {isAuthenticated ? (
              <>
                <Link to={dashboardLink} className={activeClass(dashboardLink)}>
                  Dashboard
                </Link>

                {/* CART */}
                {user?.user_type === 'consumer' && (
                  <Link to="/cart" className="relative">
                    <FaShoppingCart className="text-xl" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}

                {/* PROFILE DROPDOWN */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 hover:text-primary-600"
                  >
                    <FaUser /> {user?.name}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl rounded-xl py-2 animate-fadeIn">
                      <Link
                        to={dashboardLink}
                        className="block px-4 py-2 hover:bg-neutral-100"
                      >
                        My Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-neutral-100"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-outline"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="btn btn-primary"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0'
          } flex flex-col gap-4`}
        >
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>

          {isAuthenticated ? (
            <>
              <Link to={dashboardLink}>Dashboard</Link>
              <button onClick={handleLogout} className="btn btn-primary">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn btn-outline">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="btn btn-primary">
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;