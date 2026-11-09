
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Games from "./pages/Games";
import GameDetails from "./pages/GameDetails";
import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Leaderboard from "./pages/Leaderboard";
import ManageUsers from "./pages/ManageUsers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ManageChallenges from "./pages/ManageChallenges";


// Temporary placeholder until the assigned developer
// implements the corresponding feature.
function ComingSoon({ title }) {
  return (
    <section className="page-content">
      <h1>{title}</h1>
      <p>This feature is under development.</p>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* SCRUM-14: Authentication pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />}/>
            {/* SCRUM-17: Game pages */}
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<GameDetails />} />
            {/* SCRUM-22: Leaderboard */}
            <Route path="/leaderboard" element={<Leaderboard />}/>
            <Route path="*" element={<ComingSoon title="404 - Page Not Found" />}/>
            {/* Authenticated user pages */}
            <Route element={<ProtectedRoute />}>
              <Route path="/scores/submit" element={<ComingSoon title="Submit Score" />}/>
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/games/:gameId/challenges" element={<ManageChallenges />}/>
            </Route>
        </Routes>
      </main>

      <footer className="site-footer">
        <p>CTRL-ALT-Elite | COMP229 Web Application Development</p>
      </footer>
    </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
