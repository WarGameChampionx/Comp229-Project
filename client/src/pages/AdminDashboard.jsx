
import { Link } from "react-router-dom";
import { ShieldCheck, Users, Gamepad2 } from "lucide-react";
import "./AdminDashboard.css";

function AdminDashboard() {
  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-container">

        <header className="admin-dashboard-header">
          <ShieldCheck size={42} />
          <span className="tag">ADMINISTRATION</span>
          <h1>Admin Dashboard</h1>
          <p>Manage your GameZone users and games.</p>
        </header>

        <div className="admin-dashboard-grid">

          <Link to="/admin/users" className="admin-dashboard-card">
            <Users size={38} />
            <h2>Manage Users</h2>
            <p>
              View registered accounts, update user
              information, and manage account deletion.
            </p>
            <span>Open User Management →</span>
          </Link>

          <Link to="/games" state={{ fromAdminDashboard: true }} className="admin-dashboard-card">
            <Gamepad2 size={38} />
            <h2>Manage Games</h2>
            <p>
              Create, update, and delete games using
              the existing Games page.
            </p>
            <span>Open Games →</span>
          </Link>

        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
