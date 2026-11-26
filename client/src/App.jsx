import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Login from "./pages/login";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import MainLayout from "./components/MainLayout";
import Gallery from "./pages/Gallery";

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
        <Route path="/login" element={<PublicRoute> <Login /> </PublicRoute>} />
        <Route path="/register" element={<PublicRoute> <Register /> </PublicRoute>} />
        <Route path="/reset" element={<PublicRoute> <ResetPassword /> </PublicRoute>} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:postId" element={<PostDetail />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile/:userId/posts/:postId" element={<PostDetail />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/gallery" element={<Gallery />} />
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
