
import { useEffect, useState } from "react";
import {
  Gamepad2,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw
} from "lucide-react";

import API from "../services/api";
import "./Games.css";

function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  // Get all games from MongoDB
  const fetchGames = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/games");
      setGames(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load games."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // Open create form
  const openCreateForm = () => {
    setEditingGame(null);
    setFormData({ name: "", description: "" });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      description: game.description || ""
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Create or update a game
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setError("Please log in to manage games.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingGame) {
        await API.put(
          `/games/${editingGame._id}`,
          formData
        );

        setSuccess("Game updated successfully!");
      } else {
        await API.post("/games", formData);

        setSuccess("Game created successfully!");
      }

      setShowForm(false);
      setEditingGame(null);
      setFormData({ name: "", description: "" });

      await fetchGames();
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete a game
  const handleDelete = async (id) => {
    if (!isLoggedIn) {
      setError("Please log in to manage games.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this game?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await API.delete(`/games/${id}`);

      setSuccess("Game deleted successfully!");
      await fetchGames();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete game."
      );
    }
  };

  return (
    <section className="games-page" id="games">

      <div className="games-header">
        <div>
          <span className="tag">DISCOVER & COMPETE</span>
          <h1>Explore Games</h1>
          <p>
            Discover games, challenge yourself and climb
            the GameZone leaderboard.
          </p>
        </div>

        <button
          className="add-game-btn"
          onClick={openCreateForm}
        >
          <Plus size={19} />
          Add New Game
        </button>
      </div>

      {error && (
        <div className="games-message error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="games-message success-message">
          {success}
        </div>
      )}

      {showForm && (
        <div className="game-form-card">

          <div className="form-heading">
            <h2>
              {editingGame ? "Edit Game" : "Create New Game"}
            </h2>

            <button
              className="close-form-btn"
              onClick={() => setShowForm(false)}
              type="button"
            >
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <label htmlFor="name">Game Name</label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter game name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Describe your game..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="add-game-btn"
                disabled={saving}
              >
                {saving ? "Saving..." :
                  editingGame ? "Update Game" : "Create Game"}
              </button>

            </div>
          </form>
        </div>
      )}

      <div className="games-toolbar">
        <h2>Available Games ({games.length})</h2>

        <button
          className="refresh-btn"
          onClick={fetchGames}
          title="Refresh games"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {loading ? (

        <div className="games-loading">
          <Loader2 className="spinner" size={35} />
          <p>Loading games...</p>
        </div>

      ) : games.length === 0 ? (

        <div className="games-empty">
          <Gamepad2 size={55} />

          <h3>No Games Available Yet</h3>

          <p>
            Be the first to add a game to GameZone!
          </p>

          <button
            className="add-game-btn"
            onClick={openCreateForm}
          >
            <Plus size={18} />
            Create First Game
          </button>
        </div>

      ) : (

        <div className="games-grid">

          {games.map((game) => (

            <div className="game-card" key={game._id}>

              <div className="game-card-icon">
                <Gamepad2 size={38} />
              </div>

              <div className="game-card-content">

                <h3>{game.name}</h3>

                <p>
                  {game.description ||
                    "No description available."}
                </p>

                <small>
                  Created:{" "}
                  {new Date(game.createdAt).toLocaleDateString()}
                </small>

              </div>

              {isLoggedIn && (
                <div className="game-card-actions">

                  <button
                    className="edit-btn"
                    onClick={() => openEditForm(game)}
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(game._id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                </div>
              )}

            </div>

          ))}

        </div>
      )}

    </section>
  );
}

export default Games;
