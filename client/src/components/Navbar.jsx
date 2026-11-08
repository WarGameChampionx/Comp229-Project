
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.png";

function Navbar() {
  // React Router hook for programmatic navigation.
  const navigate = useNavigate();

  // Retrieve the current authentication state and logout function.
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();

  // Log out the user and redirect to the Home page.
  function handleLogout() {
    signOut();
    navigate("/", { replace: true });
  }

  return (
    <header className="site-header">
      <nav className="navbar">

        {/* Team logo links to Home */}
        <NavLink className="brand" to="/">
          <img
            src={logo}
            alt="CTRL-ALT-Elite logo"
            className="brand-logo"
          />
        </NavLink>

        <div className="nav-links">

          {/* Public navigation */}
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/games">Games</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>

          {/* Show different navigation links based on authentication */}
          {isAuthenticated ? (
            <>
              {/* Only administrators see Admin Games */}
              {isAdmin && (
                <NavLink to="/admin/games">
                  Admin Games
                </NavLink>
              )}

              {/* Display the logged-in username */}
              <span className="nav-username">
                {user.username}
              </span>

              {/* Logout clears the user's session */}
              <button
                type="button"
                className="nav-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Visitors see Login and Register */}
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="register-link">
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
