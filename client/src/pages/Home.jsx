
import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="hero">
      <p className="eyebrow">CTRL-ALT-Elite Presents</p>

      <h1>Arcade Leaderboard</h1>

      <p>
        Discover arcade games, submit your personal best,
        and compete for a place on the leaderboard.
      </p>

      <div className="hero-actions">
        <Link className="button" to="/games">
          Explore Games
        </Link>

        <Link className="button button-outline" to="/leaderboard">
          View Leaderboard
        </Link>
      </div>
    </section>
  );
}

export default Home;
