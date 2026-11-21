
import { useEffect, useState } from "react";
import API from "../services/api";

function Users() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await API.get("/users/me");
        setUser(response.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load user information.");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) return <p>Loading user information...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="page-content">
      <h1>Users</h1>
      <p>View your GameZone account information.</p>

      {user && (
        <div className="profile-card">
          <h2>My Account</h2>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      )}
    </section>
  );
}

export default Users;
