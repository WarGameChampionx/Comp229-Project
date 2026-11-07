
import { NavLink } from "react-router-dom";
import logo from "../assets/logo2.png";


function Navbar() {
  return (
    <header className="site-header">
      <nav className="navbar">
        <NavLink className="brand" to="/">
          <img src={logo} alt="CTRL-ALT-Elite logo" className="brand-logo" />
        </NavLink>

        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/games">Games</NavLink>
          <NavLink to="/leaderboard">Leaderboard</NavLink>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
