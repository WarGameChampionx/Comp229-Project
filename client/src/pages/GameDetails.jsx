
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function GameDetails() {
  // Extract the game ID from the URL (/games/:id).
  const { id } = useParams();

  // Store the selected game returned by the API.
  const [game, setGame] = useState(null);

  // Track loading and error conditions.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        setLoading(true);
        setError("");

        // Request the selected game from Express.
        const response = await fetch(`/api/games/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Game not found.");
          }

          throw new Error("Failed to load game details.");
        }

        const data = await response.json();

        // Support either { game: {...} } or a direct game object.
        setGame(data.game ?? data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [id]);

  if (loading) {
    return (
      <section className="page-container">
        <p>Loading game details...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-container">
        <p role="alert">{error}</p>
        <Link to="/games">Back to Games</Link>
      </section>
    );
  }

  if (!game) {
    return (
      <section className="page-container">
        <p>Game information is unavailable.</p>
        <Link to="/games">Back to Games</Link>
      </section>
    );
  }

  return (
    <section className="page-container">
      <Link className="back-link" to="/games">
        ← Back to Games
      </Link>

      <article className="game-details-card">
        <h1>{game.name}</h1>

        <p>
          {game.description || "No description available."}
        </p>

        <div className="game-details-actions">
          <Link to="/leaderboard" className="game-action-link">
            View Leaderboard
          </Link>
        </div>
      </article>
    </section>
  );
}

export default GameDetails;
