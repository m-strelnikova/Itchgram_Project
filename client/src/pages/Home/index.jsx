import { useState, useEffect } from "react";
import { useNavigate, useParams, Outlet } from "react-router";
import styles from "./Home.module.css";
import Sidebar from "../../components/Sidebar";
import PostCard from "../../components/PostCard";
import Footer from "../../components/Footer";
import CreatePostModal from "../../components/CreatePostModal";
import checkIcon from "../../assets/icons/check.svg";

function Home() {
  const [posts, setPosts] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentUserId = localStorage.getItem("userId");

  const navigate = useNavigate();
  const { postId } = useParams();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:3333/posts");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load posts");

        setPosts(data.sort(() => 0.5 - Math.random()));
      } catch (err) {
        console.error(err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleNavClick = (menuName) => {
    if (["Search", "Notifications", "Messages", "Create"].includes(menuName)) {
      setActiveModal(activeModal === menuName ? null : menuName);
    } else {
      setActiveModal(null);
      if (menuName === "Home") navigate("/");
      if (menuName === "Profile") {
        const currentUserId = localStorage.getItem("userId");
        navigate(`/profile/${currentUserId}`);
      }
    }
  };

  const handleLike = async (postIdToLike, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/posts/${postIdToLike}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPosts(posts.map(p => p._id === postIdToLike ? { ...p, likes: data.likes } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async (authorId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/users/${authorId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPosts(posts.map(p => p.author._id === authorId ? { ...p, author: { ...p.author, followers: data.followers } } : p));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar activeModal={activeModal} onNavClick={handleNavClick} />

      {activeModal === "Create" ? (
        <CreatePostModal
          onClose={() => setActiveModal(null)}
          onPostCreated={(newPost) => setPosts([newPost, ...posts])}
        />
      ) : activeModal ? (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{activeModal}</h2>
          </div>
        </div>
      ) : null}

      <main className={styles.mainContent}>
        {error && <p className={styles.errorText}>{error}</p>}
        {loading && <p className={styles.loadingText}>Loading...</p>}

        <div className={styles.feed}>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onLike={handleLike}
              onFollow={handleFollow}
              onOpenDetail={() => navigate(`/posts/${post._id}`)}
            />
          ))}
        </div>

        <div className={styles.feedEnd}>
          <img src={checkIcon} alt="Done" className={styles.endIcon} />
          <p className={styles.endTitle}>You've seen all the updates</p>
          <span className={styles.endSubtitle}>You have viewed all new publications</span>
        </div>

        <Footer handleNavClick={handleNavClick} />
      </main>

      {postId && <Outlet />}
    </div>
  );
}

export default Home;