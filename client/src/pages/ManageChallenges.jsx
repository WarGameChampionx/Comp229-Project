
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Target,
  RefreshCw,
} from "lucide-react";

import API from "../services/api";
import "./ManageChallenges.css";

function ManageChallenges() {
  // Read the game ID from /admin/games/:gameId/challenges.
  const { gameId } = useParams();

  // Retrieve optional navigation information from Games.jsx.
  const location = useLocation();
  const gameName = location.state?.gameName || "Selected Game";
  const fromAdminDashboard =
    location.state?.fromAdminDashboard === true;

  // Store the list of challenges for the selected game.
  const [challenges, setChallenges] = useState([]);

  // Track the current form mode: create or edit.
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [name, setName] = useState("");

  // Track loading, saving, and deletion operations.
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Display API errors and successful operations.
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Extract a readable error message from an Axios error.
  function getErrorMessage(err, fallback) {
    return err.response?.data?.message || err.message || fallback;
  }

  // Load all challenges belonging to the selected game.
  async function fetchChallenges() {
    setLoading(true);
    setError("");

    try {
      const response = await API.get("/challenges", {
        params: { gameId },
      });

      setChallenges(response.data.challenges || []);
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load challenges.")
      );
    } finally {
      setLoading(false);
    }
  }

  // Fetch challenges when the page opens or gameId changes.
  useEffect(() => {
    let cancelled = false;

    async function loadChallenges() {
      try {
        const response = await API.get("/challenges", {
          params: { gameId },
        });

        if (!cancelled) {
          setChallenges(response.data.challenges || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load challenges."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChallenges();

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  // Switch the form into edit mode.
  function handleEdit(challenge) {
    setEditingChallenge(challenge);
    setName(challenge.name);
    setError("");
    setSuccess("");
  }

  // Reset the form to create mode.
  function handleCancelEdit() {
    setEditingChallenge(null);
    setName("");
  }

  // Create a new challenge or update the selected challenge.
  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Challenge name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingChallenge) {
        // PATCH must contain only the name field.
        await API.patch(
          `/challenges/${editingChallenge._id}`,
          { name: trimmedName }
        );

        setSuccess("Challenge updated successfully.");
      } else {
        await API.post("/challenges", {
          gameId,
          name: trimmedName,
        });

        setSuccess("Challenge created successfully.");
      }

      handleCancelEdit();
      await fetchChallenges();
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to save challenge.")
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete a challenge after confirmation.
  async function handleDelete(challenge) {
    const confirmed = window.confirm(
      `Delete "${challenge.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(challenge._id);
    setError("");
    setSuccess("");

    try {
      await API.delete(`/challenges/${challenge._id}`);

      // Exit edit mode if the edited challenge was deleted.
      if (editingChallenge?._id === challenge._id) {
        handleCancelEdit();
      }

      setSuccess("Challenge deleted successfully.");
      await fetchChallenges();
    } catch (err) {
      // Includes HTTP 409 for challenges with existing scores.
      setError(
        getErrorMessage(err, "Unable to delete challenge.")
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Preserve dashboard-origin navigation when returning to Games.
  const gamesLinkState = fromAdminDashboard
    ? { fromAdminDashboard: true }
    : undefined;

  return (
    <section className="manage-challenges-page">
      <div className="manage-challenges-container">

        {/* Return to Games, retaining navigation context. */}
        <Link
          to="/games"
          state={gamesLinkState}
          className="manage-challenges-back"
        >
          <ArrowLeft size={18} />
          Back to Games
        </Link>

        {/* Page heading */}
        <header className="manage-challenges-header">
          <div>
            <Target size={38} />
            <h1>Manage Challenges</h1>
            <p>
              Game: <strong>{gameName}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={fetchChallenges}
            disabled={loading}
            className="manage-challenges-refresh"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        {/* Feedback messages */}
        {error && (
          <p role="alert" className="manage-challenges-error">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="manage-challenges-success">
            {success}
          </p>
        )}

        {/* Create/Edit form */}
        <div className="manage-challenges-form-card">
          <h2>
            {editingChallenge
              ? "Edit Challenge"
              : "Add Challenge"}
          </h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="challenge-name">
              Challenge Name
            </label>

            <div className="manage-challenges-form-row">
              <input
                id="challenge-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g., High Score Challenge"
                maxLength={100}
                required
              />

              <button
                type="submit"
                disabled={saving}
                className="manage-challenges-save"
              >
                {editingChallenge ? (
                  <Pencil size={17} />
                ) : (
                  <Plus size={18} />
                )}

                {saving
                  ? "Saving..."
                  : editingChallenge
                    ? "Save Changes"
                    : "Add Challenge"}
              </button>

              {editingChallenge && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="manage-challenges-cancel"
                >
                  <X size={17} />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Challenge listing */}
        <div className="manage-challenges-list">
          <h2>Existing Challenges</h2>

          {loading ? (
            <p>Loading challenges...</p>
          ) : challenges.length === 0 ? (
            <p>No challenges found for this game.</p>
          ) : (
            <div className="manage-challenges-items">
              {challenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="manage-challenges-item"
                >
                  <div className="manage-challenges-item-name">
                    <Target size={20} />
                    <span>{challenge.name}</span>
                  </div>

                  <div className="manage-challenges-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(challenge)}
                      disabled={saving || deletingId !== null}
                      className="manage-challenges-edit"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(challenge)}
                      disabled={saving || deletingId !== null}
                      className="manage-challenges-delete"
                    >
                      <Trash2 size={16} />
                      {deletingId === challenge._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default ManageChallenges;
