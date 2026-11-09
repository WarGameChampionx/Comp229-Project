
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  Gamepad2,
  House,
  Trophy,
  UserRound,
  LogOut,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();

  // Controls the mobile navigation menu.
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    signOut();
    setMenuOpen(false);
    navigate("/", { replace: true });
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="gz-site-header">
      <nav className="gz-navbar">

        {/* GameZone branding */}
        <NavLink
          to="/"
          className="gz-brand"
          onClick={closeMenu}
          aria-label="GameZone Home"
        >
          <Gamepad2 size={35} />
          <span>
            Game<span className="gz-purple-text">Zone</span>
          </span>
        </NavLink>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="gz-menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        {/* Navigation links */}
        <div
          className={`gz-nav-links ${
            menuOpen ? "gz-nav-open" : ""
          }`}
        >
          <NavLink to="/" end onClick={closeMenu}>
            <House size={19} />
            Home
          </NavLink>

          <NavLink to="/games" onClick={closeMenu}>
            <Gamepad2 size={19} />
            Games
          </NavLink>

          <NavLink to="/leaderboard" onClick={closeMenu}>
            <Trophy size={19} />
            Leaderboard
          </NavLink>

          {/* Only administrators can see the Admin Dashboard link */}
          {isAdmin && (
            <NavLink to="/admin" onClick={closeMenu}>
              <ShieldCheck size={19} />
              Admin Dashboard
            </NavLink>
          )}

          {isAuthenticated ? (
            <>
              <span className="gz-username">
                <UserRound size={19} />
                {user?.username}
              </span>

              <button
                type="button"
                className="gz-logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                <UserRound size={19} />
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="gz-register-btn"
                onClick={closeMenu}
              >
                Register
              </NavLink>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}

export default Navbar;
