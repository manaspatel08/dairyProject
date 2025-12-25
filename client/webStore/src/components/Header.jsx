import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdAccountCircle } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import { FaShoppingCart } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

import logo from "../assets/logo.jpg";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

export default function Header() {
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const closeBtnRef = useRef(null);

  const { countItems: cartCount } = useCart();
  const { countItems: wishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const setBodyPadding = () => {
      const height = headerEl.getBoundingClientRect().height;
      document.body.style.paddingTop = `${height}px`;
    };

    setBodyPadding();
    window.addEventListener("resize", setBodyPadding);

    return () => {
      window.removeEventListener("resize", setBodyPadding);
      document.body.style.paddingTop = "";
    };
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  const closeSidebar = () => {
    closeBtnRef.current?.click();
  };

  return (
    <>
      <header
        ref={headerRef}
        className="position-fixed top-0 start-0 w-100 bg-white shadow-sm"
        style={{ zIndex: 999 }}
      >
        <nav className="navbar bg-white border-bottom px-3">
          <div className="container-fluid d-flex align-items-center">
            <button
              className="btn p-0 me-3"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#sideMenu"
            >
              <GiHamburgerMenu size={26} />
            </button>

            <div className="flex-grow-1 text-center fw-semibold fs-5 d-flex justify-content-center">
              DairyProduct
            </div>

            <div className="d-none d-md-flex ms-auto small text-muted fw-semibold">
              📞 +123 (456) 7890
            </div>

            <div className="d-md-none ms-2">
              <button
                className="btn position-relative p-0 border-0 bg-transparent"
                onClick={() => navigate("/")}
              >
                <img
                  src={logo}
                  alt="logo"
                  style={{ width: 80, height: "auto" }}
                />
              </button>
            </div>
          </div>
        </nav>

        <div className="container-fluid py-2">
          <div className="row align-items-center px-3">
            <div className="col-md-3 d-none d-md-flex align-items-center">
              <button
                className="btn position-relative p-0 border-0 bg-transparent"
                onClick={() => navigate("/")}
              >
                <img
                  src={logo}
                  alt="logo"
                  style={{ width: 120, height: "auto" }}
                />
              </button>
            </div>

            <div className="col-2 d-md-none">
              <button
                type="button"
                className="btn p-0"
                aria-label="Search"
                onClick={() => setShowMobileSearch((prev) => !prev)}
              >
                <FiSearch size={22} />
              </button>
            </div>

            <div className="col-md-6 d-none d-md-flex justify-content-center">
              <div style={{ width: "100%", maxWidth: "380px" }}>
                <SearchBar />
              </div>
            </div>

            <div className="col-md-3 col-10 d-flex justify-content-end align-items-center gap-3">
              <div className="d-none d-md-flex gap-3 align-items-center">
                <div className="dropdown">
                  {isAuthenticated() ? (
                    <>
                      <button
                        className="btn p-0 border-0 bg-transparent d-flex align-items-center gap-1"
                        id="headerProfileBtn"
                        data-bs-toggle="dropdown"
                        aria-expanded={dropdownOpen}
                        onClick={() => setDropdownOpen((s) => !s)}
                      >
                        <MdAccountCircle size={24} />
                        <span className="d-none d-lg-inline small">
                          {user?.email?.split("@")[0] || "Account"}
                        </span>
                      </button>

                      <ul
                        className={`dropdown-menu dropdown-menu-end${
                          dropdownOpen ? " show" : ""
                        }`}
                        aria-labelledby="headerProfileBtn"
                        style={{ minWidth: 160 }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              navigate("/profile");
                            }}
                          >
                            Profile
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              navigate("/profile/address");
                            }}
                          >
                            Address
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              navigate("/orders");
                            }}
                          >
                            Orders
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={handleLogout}
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <button
                      className="btn p-0 border-0 bg-transparent d-flex align-items-center gap-1"
                      onClick={() => navigate("/login")}
                    >
                      <MdAccountCircle size={24} />
                      <span className="d-none d-lg-inline small">Login</span>
                    </button>
                  )}
                </div>

                <button
                  className="btn position-relative p-0 border-0 bg-transparent"
                  aria-label="Wishlist"
                  onClick={() => navigate("/wishlist")}
                >
                  <CiHeart size={24} />
                  {wishlistCount > 0 && (
                    <span
                      className="position-absolute translate-middle badge rounded-pill bg-danger"
                      style={{
                        top: "1px",
                        right: "-17px",
                        fontSize: "0.65rem",
                      }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  className="btn position-relative p-0 border-0 bg-transparent"
                  onClick={() => navigate("/wishlist")}
                >
                  <span className="d-none d-lg-inline">Wishlist</span>
                </button>

                <button
                  className="btn position-relative p-0 border-0 bg-transparent"
                  aria-label="Cart"
                  onClick={() => navigate("/cart")}
                >
                  <FaShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span
                      className="position-absolute translate-middle badge rounded-pill bg-danger"
                      style={{
                        top: "1px",
                        right: "-17px",
                        fontSize: "0.65rem",
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  className="btn position-relative p-0 border-0 bg-transparent"
                  onClick={() => navigate("/cart")}
                >
                  <span className="d-none d-lg-inline">Cart</span>
                </button>
              </div>

              <div className="d-flex d-md-none gap-3">
                {isAuthenticated() ? (
                  <button
                    className="btn p-0 border-0 bg-transparent"
                    onClick={() => setDropdownOpen((s) => !s)}
                    aria-label="Account"
                  >
                    <MdAccountCircle size={22} />
                  </button>
                ) : (
                  <button
                    className="btn p-0 border-0 bg-transparent"
                    onClick={() => navigate("/login")}
                    aria-label="Login"
                  >
                    <MdAccountCircle size={22} />
                  </button>
                )}

                <button
                  className="position-relative btn p-0 border-0 bg-transparent"
                  aria-label="Wishlist"
                  onClick={() => navigate("/wishlist")}
                >
                  <CiHeart size={22} />
                  {wishlistCount > 0 && (
                    <span
                      className="position-absolute badge rounded-pill bg-danger"
                      style={{
                        top: "-3px",
                        right: "-10px",
                        fontSize: "0.6rem",
                        minWidth: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  className="position-relative btn p-0 border-0 bg-transparent"
                  onClick={() => navigate("/cart")}
                  aria-label="Cart"
                >
                  <FaShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span
                      className="position-absolute badge rounded-pill bg-danger"
                      style={{
                        top: "-4px",
                        right: "-10px",
                        fontSize: "0.6rem",
                        minWidth: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {showMobileSearch && (
            <div className="row d-md-none mt-2 px-3">
              <div className="col-12">
                <div className="shrink-search w-100">
                  <SearchBar />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="offcanvas offcanvas-start" id="sideMenu">
        <div className="offcanvas-header">
          <h5 className="fw-semibold text-dark">Menu</h5>
          <button
            ref={closeBtnRef}
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body">
          <ul className="list-unstyled">
            <li>
              <Link className="nav-link" to="/" onClick={closeSidebar}>
                Home
              </Link>
            </li>

            <li>
              <Link className="nav-link" to="/products" onClick={closeSidebar}>
                Products
              </Link>
            </li>

            <li>
              <Link className="nav-link" to="/wishlist" onClick={closeSidebar}>
                Wishlist
              </Link>
            </li>

            <li>
              <Link className="nav-link" to="/cart" onClick={closeSidebar}>
                My Cart
              </Link>
            </li>

            <li>
              <Link className="nav-link" to="/orders" onClick={closeSidebar}>
                My Orders
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {dropdownOpen && (
        <div
          className="d-md-none position-fixed"
          style={{
            top: headerRef.current?.getBoundingClientRect().height || 56,
            right: 8,
            zIndex: 1100,
          }}
        >
          <div className="card">
            <ul className="list-group list-group-flush">
              {isAuthenticated() ? (
                <>
                  <li
                    className="list-group-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profile");
                    }}
                  >
                    Profile
                  </li>
                  <li
                    className="list-group-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profile/address");
                    }}
                  >
                    Address
                  </li>
                  <li
                    className="list-group-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/orders");
                    }}
                  >
                    Orders
                  </li>
                  <li
                    className="list-group-item text-danger"
                    onClick={() => {
                      handleLogout();
                    }}
                  >
                    Logout
                  </li>
                </>
              ) : (
                <li
                  className="list-group-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/login");
                  }}
                >
                  Login
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
