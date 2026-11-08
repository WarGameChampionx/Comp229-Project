import Games from "./pages/Games";

import { useState } from "react";
import {
  Gamepad2,
  Trophy,
  Home,
  User,
  LogIn,
  Menu,
  X,
  Medal,
  Users
} from "lucide-react";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <Gamepad2 size={30} />
          <span>Game<span className="highlight">Zone</span></span>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <a href="#home"><Home size={17} /> Home</a>
          <a href="#games"><Gamepad2 size={17} /> Games</a>
          <a href="#leaderboard"><Trophy size={17} /> Leaderboard</a>
          <a href="#login"><User size={17} /> Login</a>
          <button className="signup-btn">Register</button>
        </div>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="tag">WELCOME TO GAMEZONE</span>

            <h1>
              PLAY HARD.
              <br />
              <span>CLIMB THE RANKS.</span>
            </h1>

            <p>
              Challenge your friends, compete with other players,
              track your scores and become a gaming champion.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn">
                Explore Games
              </button>
              <button className="secondary-btn">
                <Trophy size={18} /> View Leaderboard
              </button>
            </div>
          </div>

          <div className="hero-icon">
            <Gamepad2 size={190} strokeWidth={1} />
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <Users />
            <h2>--</h2>
            <p>Registered Players</p>
          </div>

          <div className="stat-card">
            <Gamepad2 />
            <h2>--</h2>
            <p>Available Games</p>
          </div>

          <div className="stat-card">
            <Trophy />
            <h2>--</h2>
            <p>Competitions</p>
          </div>
        </section>

        <Games />

        <section className="leaderboard-section" id="leaderboard">
          <div className="section-heading">
            <div>
              <span className="tag">TOP PLAYERS</span>
              <h2>Leaderboard</h2>
            </div>
            <Medal size={35} />
          </div>

          <div className="empty-card">
            <Trophy size={45} />
            <h3>Be the first champion!</h3>
            <p>Player rankings will appear here.</p>
          </div>
        </section>
      </main>

      <footer>
        <div className="logo">
          <Gamepad2 size={23} />
          Game<span className="highlight">Zone</span>
        </div>
        <p>© 2026 GameZone. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
