import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import SignOut from "./SignOut";
import { useGlobalContext } from "../GlobalContext";

const SideNavbar = ({ isOpen, toggleNavbar }) => {
  const { user } = useAuth();
  const { orgSelected } = useGlobalContext();

  return (
    <>
      {/* Side Navbar */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-gray-800 text-white transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-10`}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Menu</h2>
          {/* Hamburger Icon inside the sidebar */}
          <button
            className="p-2 text-gray-600" // Hamburger icon styling
            onClick={toggleNavbar} // This now toggles the sidebar
            aria-label="Toggle menu" // For accessibility
          >
            {isOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>

        <ul className="p-4">
          <li className="py-2">
            <Link to="/" onClick={toggleNavbar}>
              Home
            </Link>
          </li>
          {user ? null : (
            <li className="py-2">
              <Link to="/sign-up" onClick={toggleNavbar}>
                Sign Up
              </Link>
            </li>
          )}
          {user ? null : (
            <li className="py-2">
              <Link to="/sign-in" onClick={toggleNavbar}>
                Sign In
              </Link>
            </li>
          )}

          {user ? (
            <li className="py-2">
              <Link to="/dashboard" onClick={toggleNavbar}>
                Dashboard
              </Link>
            </li>
          ) : null}

          {user && orgSelected && (
            <li className="py-2">
              <Link to="/org-dashboard" onClick={toggleNavbar}>
                Organization
              </Link>
            </li>
          )}

          {user ? (
            <li className="py-2">
              <SignOut />
            </li>
          ) : null}
        </ul>
      </div>
    </>
  );
};

export default SideNavbar;
