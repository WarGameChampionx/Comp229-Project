import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth"; // Adjust the import path based on your project structure
import "./SubmitScore.css"; // Adjust the path based on your project structure

const API_BASE_URL = "http://localhost:5000"; // Replace with your actual API base URL

const GAMES_ENDPOINT = '/api/games'; // Replace with your actual endpoint for fetching games
const SCORES_ENDPOINT = '/api/scores'; // Replace with your actual endpoint for submitting scores

// const SUBMIT_SCORE_ENDPOINT = '/api/scores'; // Replace with your actual endpoint for submitting scores

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
    const [messageType, setMessageType] = useState(""); // "success" or "error"
    const { token, isAuthenticated } = useAuth(); 

    useEffect(() => {
        async function loadGames() {
            setLoadingGames(true);

            try {
                const response = await fetch(
                    `${API_BASE_URL}${GAMES_ENDPOINT}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch games.");  
                }

                const data = await response.json();

                const avalibleGames = Array.isArray(data) 
                ? data 
                : data.games;

                if (!Array.isArray(avalibleGames)) {
                    throw new Error("Unexpected games response"); 
                }

                setGames(avalibleGames);
            } catch (error) {
                setMessage(`Error loading games: ${error.message}`);
                setMessageType("error");
            } finally {
                setLoadingGames(false);
            }
        }
        loadGames();
    }, []);

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
            const response = await fetch(
                `${API_BASE_URL}${GAMES_ENDPOINT}/${gameId}` 
            );

            if (!response.ok) {
                throw new Error("Failed to fetch challenges.");
            }

            const data = await response.json();

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

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage(""); 
        setMessageType("");

        // Check login status 
        
        if (!isAuthenticated || !token) {
            setMessage("You must be logged in to submit a score.");
            setMessageType("error");
            return;
        }

        // Validate game selection.
        if (!selectedGame) {
            setMessage("Please select a game.");
            setMessageType("error");
            return;
        }

        // Validate challenge selection.
        if (!selectedChallenge) {
            setMessage("Please select a challenge.");
            setMessageType("error");
            return;
        }

        // Validate score.
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
            const response = await fetch(
                `${API_BASE_URL}${SCORES_ENDPOINT}`, 
                {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    gameId: selectedGame, 
                    points: Number(points),
                    challengeId: selectedChallenge,
                    value: Number(points) 
                }) 
            });

            const data = await response.json().catch(() => ({})); // Handle cases where response is not JSON

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to submit score."
                );
            }

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


    // The page display 
    return (
        <main className="submit-score-page">
            <div className="submit-score-container">
                <header className="submit-score-header">
                    <h1>Submit Your Score</h1>
                    <p>
                        Select a game and challenge to submit your score. Make sure you are logged in to submit.
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
                                        <option key={game._id} value={game._id}>
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
                                                setSelectedChallenge(event.target.value)
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
                                <label htmlFor="points">Enter Your Score:</label>
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
                                {submitting ? "Submitting..." : "Submit Score"}
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