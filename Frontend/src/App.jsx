import { Navigate, Route, Routes } from "react-router-dom";
import { Home, Login, Profile, SignUp } from "@/pages";
import { useAuth } from "@/context/AuthContext";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/sign-up"
        element={!isAuthenticated ? <SignUp /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
