
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  ShieldCheck
} from "lucide-react";

import API from "../services/api";
import "./ManageUsers.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Extract a readable error message from Axios.
  function getErrorMessage(err, fallback) {
    return err.response?.data?.message || err.message || fallback;
  }

  // Load users when the page first opens.
  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const response = await API.get("/users");

        if (!Array.isArray(response.data.users)) {
          throw new Error("Invalid users API response");
        }

        if (!cancelled) {
          setUsers(response.data.users);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Unable to load users."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh the list after changes or when Refresh is clicked.
  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/users");

      if (!Array.isArray(response.data.users)) {
        throw new Error("Invalid users API response");
      }

      setUsers(response.data.users);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to refresh users."));
    } finally {
      setLoading(false);
    }
  }

  // Populate the edit form with the selected user's details.
  function openEditForm(user) {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email
    });

    setError("");
    setSuccess("");
  }

  function closeEditForm() {
    setEditingUser(null);
    setFormData({ username: "", email: "" });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  }

  // Save username/email changes.
  async function handleSubmit(event) {
    event.preventDefault();

    if (!editingUser) return;

    const username = formData.username.trim();
    const email = formData.email.trim();

    if (!username || !email) {
      setError("Username and email are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await API.patch(`/users/${editingUser.id}`, {
        username,
        email
      });

      closeEditForm();
      await fetchUsers();

      setSuccess("User updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update user."));
    } finally {
      setSaving(false);
    }
  }

  // Delete only after administrator confirmation.
  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Delete the account "${user.username}"?\n\n` +
      "Accounts with existing scores cannot be deleted."
    );

    if (!confirmed) return;

    try {
      setDeletingId(user.id);
      setError("");
      setSuccess("");

      await API.delete(`/users/${user.id}`);

      if (editingUser?.id === user.id) {
        closeEditForm();
      }

      await fetchUsers();
      setSuccess(`User "${user.username}" deleted successfully.`);
    } catch (err) {
      // Includes 409 Conflict for users with existing scores.
      setError(getErrorMessage(err, "Unable to delete user."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="manage-users-page">
      <div className="manage-users-container">

        <Link to="/admin" className="manage-users-back">
          <ArrowLeft size={18} />
          Back to Admin Dashboard
        </Link>

        <header className="manage-users-header">
          <div>
            <span className="tag">ADMINISTRATION</span>
            <h1>
              <Users size={32} />
              Manage Users
            </h1>
            <p>
              View and manage registered GameZone accounts.
            </p>
          </div>

          <button
            type="button"
            className="manage-users-refresh"
            onClick={fetchUsers}
            disabled={loading || saving || Boolean(deletingId)}
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="manage-users-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="manage-users-success" role="status">
            {success}
          </div>
        )}

        {editingUser && (
          <div className="manage-users-form-card">

            <div className="manage-users-form-heading">
              <h2>Edit User</h2>

              <button
                type="button"
                onClick={closeEditForm}
                disabled={saving}
                aria-label="Close edit form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="edit-username">Username</label>
              <input
                id="edit-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                minLength={3}
                maxLength={30}
                required
              />

              <label htmlFor="edit-email">Email</label>
              <input
                id="edit-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div className="manage-users-form-actions">
                <button
                  type="button"
                  className="manage-users-cancel"
                  onClick={closeEditForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="manage-users-save"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="manage-users-list">
          <h2>Registered Users ({users.length})</h2>

          {loading ? (
            <p className="manage-users-empty">
              Loading users...
            </p>
          ) : users.length === 0 ? (
            <p className="manage-users-empty">
              No users found.
            </p>
          ) : (
            <div className="manage-users-table-wrap">
              <table className="manage-users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={
                            user.role === "admin"
                              ? "manage-users-role admin"
                              : "manage-users-role"
                          }
                        >
                          {user.role === "admin" && (
                            <ShieldCheck size={14} />
                          )}
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <div className="manage-users-actions">
                          <button
                            type="button"
                            className="manage-users-edit"
                            onClick={() => openEditForm(user)}
                            disabled={saving || Boolean(deletingId)}
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="manage-users-delete"
                            onClick={() => handleDelete(user)}
                            disabled={saving || Boolean(deletingId)}
                          >
                            <Trash2 size={15} />
                            {deletingId === user.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default ManageUsers;
