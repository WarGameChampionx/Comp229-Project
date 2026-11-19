
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

import API from "../services/api";
import "./FeaturedGames.css";

// Select up to three different games at random.
function selectRandomGames(games, count = 3) {
  const selected = [...games];
  const limit = Math.min(count, selected.length);

  // Partial Fisher-Yates shuffle.
  for (let i = 0; i < limit; i++) {
    const randomIndex =
      i + Math.floor(Math.random() * (selected.length - i));

    [selected[i], selected[randomIndex]] =
      [selected[randomIndex], selected[i]];
  }

  return selected.slice(0, limit);
}

function FeaturedGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      try {
        const response = await API.get("/games");

        const gameList = Array.isArray(response.data)
          ? response.data
          : response.data?.games;

        if (!Array.isArray(gameList)) {
          throw new Error("Invalid games API response");
        }

        if (!cancelled) {
          setGames(selectRandomGames(gameList));
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load featured games.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="featured-games">
      <div className="featured-games-header">
        <h2>Featured Games</h2>
        <p>
          Discover a game, take on challenges and
          compete for the top score.
        </p>
      </div>

      {loading ? (
        <p className="featured-games-message">
          Loading featured games...
        </p>
      ) : error ? (
        <p className="featured-games-message" role="alert">
          {error}
        </p>
      ) : games.length === 0 ? (
        <p className="featured-games-message">
          No games available yet. Check back soon!
        </p>
      ) : (
        <div className="featured-games-grid">
          {games.map((game) => (
            <article
              key={game._id}
              className="featured-game-card"
            >
              <Gamepad2
                size={38}
                className="featured-game-icon"
                aria-hidden="true"
              />

              <h3>{game.name}</h3>

              <p>
                {game.description ||
                  "Discover this game and its challenges."}
              </p>

              <Link
                to={`/games/${game._id}`}
                className="featured-game-link"
              >
                View Details
              </Link>
            </article>
          ))}
        </div>
      )}

      <div className="featured-games-footer">
        <Link to="/games" className="featured-all-games">
          Explore All Games
        </Link>
      </div>
    </section>
  );
}

export default FeaturedGames;
