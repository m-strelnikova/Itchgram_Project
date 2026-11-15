import { Routes, Route, Navigate } from "react-router";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Login from "./pages/login";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <>
     <Routes>
      <Route path="/" element={<ProtectedRoute> <Home /> </ProtectedRoute>} />

      <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute>} />
      <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} />
      <Route path="/reset" element={<PublicRoute> <ResetPassword /> </PublicRoute>} />

      <Route 
        path="/posts/:postId" 
        element={
          <ProtectedRoute>
            <Home />
            <PostDetail />
          </ProtectedRoute>
        } 
      />

      <Route path="/profile/:userId" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default App
