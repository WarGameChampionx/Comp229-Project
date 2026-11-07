
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";

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
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* SCRUM-14: Authentication pages */}
          <Route
            path="/login"
            element={<ComingSoon title="Login" />}
          />
          <Route
            path="/register"
            element={<ComingSoon title="Register" />}
          />

          {/* SCRUM-17: Game pages */}
          <Route
            path="/games"
            element={<ComingSoon title="Games" />}
          />
          <Route
            path="/games/:id"
            element={<ComingSoon title="Game Details" />}
          />
          <Route
            path="/admin/games"
            element={<ComingSoon title="Manage Games" />}
          />

          {/* SCRUM-20: Score submission */}
          <Route
            path="/scores/submit"
            element={<ComingSoon title="Submit Score" />}
          />

          {/* SCRUM-22: Leaderboard */}
          <Route
            path="/leaderboard"
            element={<ComingSoon title="Leaderboard" />}
          />

          <Route
            path="*"
            element={<ComingSoon title="404 - Page Not Found" />}
          />
        </Routes>
      </main>

      <footer className="site-footer">
        <p>CTRL-ALT-Elite | COMP229 Web Application Development</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
