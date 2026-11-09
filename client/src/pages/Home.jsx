
import { Link } from "react-router-dom";
import { Gamepad2, Trophy } from "lucide-react";

function Home() {
  return (
    <section className="gz-hero">
      <div className="gz-hero-inner">

        {/* Left side: Welcome and navigation */}
        <div className="gz-hero-content">
          <p className="gz-hero-eyebrow">
            WELCOME TO GAMEZONE
          </p>

          <h1 className="gz-hero-title">
            <span>PLAY HARD.</span>
            <span className="gz-purple-text">
              CLIMB THE RANKS.
            </span>
          </h1>

          <p className="gz-hero-description">
            Challenge your friends, compete with other
            players, track your scores and become a
            gaming champion.
          </p>

          <div className="gz-hero-actions">
            <Link to="/games" className="gz-primary-btn">
              Explore Games
            </Link>

            <Link
              to="/leaderboard"
              className="gz-secondary-btn"
            >
              <Trophy size={20} />
              View Leaderboard
            </Link>
          </div>
        </div>

        {/* Right side: Game-controller illustration */}
        <div className="gz-hero-visual" aria-hidden="true">
          <Gamepad2 className="gz-hero-controller" />
        </div>

      </div>
    </section>
  );
}

export default Home;
