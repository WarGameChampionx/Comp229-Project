
import { useAuth } from "../hooks/useAuth";

function Profile() {
  const { user } = useAuth();

  return (
    <section className="page-content">
      <h1>My Profile</h1>
      <p>View your GameZone account information.</p>

      <div className="profile-card">
        <h2>Account Information</h2>

        <p>
          <strong>Username:</strong>{" "}
          {user?.username || "Not available"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {user?.email || "Not available"}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user?.role || "User"}
        </p>
      </div>
    </section>
  );
}

export default Profile;
