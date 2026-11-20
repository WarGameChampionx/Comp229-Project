
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../services/api";
import "./SubmitScore.css";

function SubmitScore() {
    const [games, setGames] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [selectedGame, setSelectedGame] = useState("");
    const [selectedChallenge, setSelectedChallenge] = useState("");
    const [points, setPoints] = useState("");
    const [loadingGames, setLoadingGames] = useState(true);
    const [loadingChallenges, setLoadingChallenges] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const { token, isAuthenticated } = useAuth();

    // Load available games.
    useEffect(() => {
        async function loadGames() {
            setLoadingGames(true);

            try {
                const data = await apiRequest("/games");

                const availableGames = Array.isArray(data)
                    ? data
                    : data.games;

                if (!Array.isArray(availableGames)) {
                    throw new Error("Unexpected games response");
                }

                setGames(availableGames);
            } catch (error) {
                setMessage(`Error loading games: ${error.message}`);
                setMessageType("error");
            } finally {
                setLoadingGames(false);
            }
        }

        loadGames();
    }, []);

    // Load challenges when a game is selected.
    const handleGameChange = async (event) => {
        const gameId = event.target.value;

        setSelectedGame(gameId);
        setSelectedChallenge("");
        setChallenges([]);
        setMessage("");
        setMessageType("");

        if (!gameId) {
            return;
        }

        setLoadingChallenges(true);

        try {
            const data = await apiRequest(`/games/${gameId}`);

            if (!Array.isArray(data.challenges)) {
                throw new Error("Unexpected challenges response");
            }

            setChallenges(data.challenges);
        } catch (error) {
            setMessage(`Error loading challenges: ${error.message}`);
            setMessageType("error");
        } finally {
            setLoadingChallenges(false);
        }
    };

    // Submit score.
    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setMessageType("");

        if (!isAuthenticated || !token) {
            setMessage("You must be logged in to submit a score.");
            setMessageType("error");
            return;
        }

        if (!selectedGame) {
            setMessage("Please select a game.");
            setMessageType("error");
            return;
        }

        if (!selectedChallenge) {
            setMessage("Please select a challenge.");
            setMessageType("error");
            return;
        }

        if (
            points.trim() === "" ||
            !/^\d+$/.test(points.trim()) ||
            !Number.isSafeInteger(Number(points))
        ) {
            setMessage("Please enter a valid non-negative whole number.");
            setMessageType("error");
            return;
        }

        setSubmitting(true);

        try {
            await apiRequest("/scores", {
                method: "POST",
                token,
                body: {
                    gameId: selectedGame,
                    points: Number(points),
                    challengeId: selectedChallenge,
                    value: Number(points)
                }
            });

            setMessage("Score submitted successfully!");
            setMessageType("success");

            setSelectedGame("");
            setSelectedChallenge("");
            setChallenges([]);
            setPoints("");

        } catch (error) {
            setMessage(error.message);
            setMessageType("error");
        } finally {
            setSubmitting(false);
        }
    };

    // Page display.
    return (
        <main className="submit-score-page">
            <div className="submit-score-container">
                <header className="submit-score-header">
                    <h1>Submit Your Score</h1>
                    <p>
                        Select a game and challenge to submit your score.
                        Make sure you are logged in to submit.
                    </p>
                </header>

                <section className="submit-score-card">
                    {loadingGames ? (
                        <p className="submit-score-status">
                            Loading games...
                        </p>
                    ) : games.length === 0 ? (
                        <p className="submit-score-status">
                            No games available.
                        </p>
                    ) : (
                        <form
                            className="submit-score-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="form-group">
                                <label htmlFor="game">Game:</label>

                                <select
                                    id="game"
                                    value={selectedGame}
                                    onChange={handleGameChange}
                                    required
                                >
                                    <option value="">Select a game</option>

                                    {games.map((game) => (
                                        <option
                                            key={game._id}
                                            value={game._id}
                                        >
                                            {game.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedGame && (
                                <div>
                                    <label htmlFor="challenge">
                                        Select a Challenge:
                                    </label>

                                    {loadingChallenges ? (
                                        <p className="submit-score-status">
                                            Loading available challenges...
                                        </p>
                                    ) : challenges.length === 0 ? (
                                        <p className="submit-score-status">
                                            No challenges available.
                                        </p>
                                    ) : (
                                        <select
                                            id="challenge"
                                            value={selectedChallenge}
                                            onChange={(event) =>
                                                setSelectedChallenge(
                                                    event.target.value
                                                )
                                            }
                                            required
                                        >
                                            <option value="">
                                                Choose a challenge
                                            </option>

                                            {challenges.map((challenge) => (
                                                <option
                                                    key={challenge._id}
                                                    value={challenge._id}
                                                >
                                                    {challenge.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            <div>
                                <label htmlFor="points">
                                    Enter Your Score:
                                </label>

                                <input
                                    id="points"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={points}
                                    onChange={(event) =>
                                        setPoints(event.target.value)
                                    }
                                    required
                                />
                            </div>

                            <button
                                className="submit-score-btn"
                                type="submit"
                                disabled={
                                    submitting ||
                                    loadingGames ||
                                    loadingChallenges ||
                                    !selectedGame ||
                                    !selectedChallenge
                                }
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Score"}
                            </button>
                        </form>
                    )}

                    {message && (
                        <p
                            className={`submit-score-message ${messageType}`}
                            role="status"
                        >
                            {message}
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}

export default SubmitScore;
