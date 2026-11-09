
import { useEffect, useState } from "react";
import { Trophy, Gamepad2, Loader2 } from "lucide-react";

import API from "../services/api";
import "./Leaderboard.css";

function Leaderboard() {
  const [games, setGames] = useState([]);
  const [gameId, setGameId] = useState("");

  const [challenges, setChallenges] = useState([]);
  const [challengeId, setChallengeId] = useState("");

  const [leaderboard, setLeaderboard] = useState([]);
  const [challengeName, setChallengeName] = useState("");

  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);

  const [error, setError] = useState("");

  // Load available games when the page opens.
  useEffect(() => {
    let cancelled = false;

    async function loadGames() {
      try {
        const response = await API.get("/games");

        const gameList = Array.isArray(response.data)
          ? response.data
          : response.data.games;

        if (!Array.isArray(gameList)) {
          throw new Error("Invalid games API response");
        }

        if (!cancelled) {
          setGames(gameList);
          setGameId(gameList[0]?._id || "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load games."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingGames(false);
        }
      }
    }

    loadGames();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load challenges whenever the selected game changes.
  useEffect(() => {
    let cancelled = false;

    async function loadChallenges() {
      setLoadingChallenges(true);
      setError("");
      setChallenges([]);
      setChallengeId("");
      setLeaderboard([]);
      setChallengeName("");

      try {
        const response = await API.get("/challenges", {
          params: { gameId }
        });

        const challengeList = response.data.challenges;

        if (!Array.isArray(challengeList)) {
          throw new Error("Invalid challenges API response");
        }

        if (!cancelled) {
          setChallenges(challengeList);
          setChallengeId(challengeList[0]?._id || "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load challenges."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingChallenges(false);
        }
      }
    }

    if (gameId) {
      loadChallenges();
    }

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  // Load rankings whenever the selected challenge changes.
  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setLoadingScores(true);
      setError("");
      setLeaderboard([]);
      setChallengeName("");

      try {
        const response = await API.get(
          `/leaderboards/${challengeId}`
        );

        if (!Array.isArray(response.data.leaderboard)) {
          throw new Error("Invalid leaderboard API response");
        }

        if (!cancelled) {
          setLeaderboard(response.data.leaderboard);
          setChallengeName(response.data.challengeName);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load leaderboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingScores(false);
        }
      }
    }

    if (challengeId) {
      loadLeaderboard();
    }

    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  function handleGameChange(event) {
    setGameId(event.target.value);
    setChallengeId("");
    setChallenges([]);
    setLeaderboard([]);
    setChallengeName("");
  }

  function handleChallengeChange(event) {
    setChallengeId(event.target.value);
    setLeaderboard([]);
    setChallengeName("");
  }

  return (
    <section className="leaderboard-page">
      <div className="leaderboard-container">

        <header className="leaderboard-header">
          <Trophy size={42} />
          <span className="tag">THE BEST OF THE BEST</span>
          <h1>Leaderboard</h1>
          <p>
            Select a game and challenge to see
            who's leading the competition.
          </p>
        </header>

        <div className="leaderboard-filters">
          <div>
            <label htmlFor="leaderboard-game">
              <Gamepad2 size={18} />
              Select Game
            </label>

            <select
              id="leaderboard-game"
              value={gameId}
              onChange={handleGameChange}
              disabled={loadingGames || games.length === 0}
            >
              {games.length === 0 && (
                <option value="">
                  {loadingGames ? "Loading games..." : "No games"}
                </option>
              )}

              {games.map((game) => (
                <option key={game._id} value={game._id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="leaderboard-challenge">
              <Trophy size={18} />
              Select Challenge
            </label>

            <select
              id="leaderboard-challenge"
              value={challengeId}
              onChange={handleChallengeChange}
              disabled={
                !gameId ||
                loadingChallenges ||
                challenges.length === 0
              }
            >
              {challenges.length === 0 && (
                <option value="">
                  {loadingChallenges
                    ? "Loading challenges..."
                    : "No challenges available"}
                </option>
              )}

              {challenges.map((challenge) => (
                <option
                  key={challenge._id}
                  value={challenge._id}
                >
                  {challenge.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="leaderboard-error" role="alert">
            {error}
          </div>
        )}

        {(loadingGames ||
          loadingChallenges ||
          loadingScores) && (
          <div className="leaderboard-status" role="status">
            <Loader2 className="spinner" size={32} />
            <p>Loading leaderboard...</p>
          </div>
        )}

        {!error &&
          !loadingGames &&
          games.length === 0 && (
            <div className="leaderboard-status">
              <p>No games are available yet.</p>
            </div>
          )}

        {!error &&
          !loadingChallenges &&
          !loadingGames &&
          gameId &&
          challenges.length === 0 && (
            <div className="leaderboard-status">
              <p>This game has no challenges yet.</p>
            </div>
          )}

        {!error &&
          !loadingScores &&
          !loadingChallenges &&
          challengeId &&
          leaderboard.length === 0 && (
            <div className="leaderboard-status">
              <Trophy size={35} />
              <p>No scores have been recorded yet.</p>
            </div>
          )}

        {!error &&
          !loadingScores &&
          !loadingChallenges &&
          challengeId &&
          leaderboard.length > 0 && (
            <div className="leaderboard-card">
              <div className="leaderboard-card-header">
                <h2>{challengeName}</h2>
                <Trophy size={23} />
              </div>

              <div className="leaderboard-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Rank</th>
                      <th scope="col">Player</th>
                      <th scope="col">Score</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leaderboard.map((entry) => (
                      <tr key={entry.rank}>
                        <td>
                          {entry.rank === 1
                            ? "🥇"
                            : entry.rank === 2
                            ? "🥈"
                            : entry.rank === 3
                            ? "🥉"
                            : `#${entry.rank}`}
                        </td>
                        <td>{entry.username}</td>
                        <td className="leaderboard-score">
                          {entry.score.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      </div>
    </section>
  );
}

export default Leaderboard;
