
import { useState } from "react";
import { AuthContext } from "./AuthContext";

function readStoredUser() {
  try {
    const stored = sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("token")
  );

  const [user, setUser] = useState(readStoredUser);

  // Save a successful backend login response.
  function signIn(loginResponse) {
    const { token: newToken, user: newUser } = loginResponse;

    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  }

  // Clear authentication details on logout.
  function signOut() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isAdmin: Boolean(token && user?.role === "admin"),
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
