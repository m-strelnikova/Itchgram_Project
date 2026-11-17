import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import Sidebar from "../../components/Sidebar";
import CreatePostModal from "../../components/CreatePostModal";
import ProfileHeader from "../../components/ProfileHeader";


function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeModal, setActiveModal] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch("http://localhost:3333/posts");
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to load posts");

                const filteredPosts = data
                    .filter((post) => post.author._id === userId)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setPosts(filteredPosts);
            } catch (err) {
                console.error(err);
                setError("Failed to load posts. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchPosts();
        }
    }, [userId]);

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
    return (
        <div className={styles.layout}>
            <Sidebar activeModal={activeModal} onNavClick={handleNavClick} />

            <section className={styles.mainContent}>
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

                <ProfileHeader
                    profileUserId={ userId }
                    postsCount={ posts.length }
                    onOpenMessageModal={() => setActiveModal("Messages")}
                />
                <main>
                    {error && <p className={styles.errorText}>{error}</p>}
                    {loading && <p className={styles.loadingText}>Loading...</p>}

                    <div className={styles.feed}>
                        {posts.map((post) => (
                            <article key={post._id} className={styles.imageContainer}
                                onClick={() => navigate(`/posts/${post._id}`)}
                                style={{ cursor: "pointer" }}>
                                <img src={post.imageUrl} alt="Image profil feed" className={styles.postImage} />
                            </article>
                        ))}
                    </div>
                </main>
            </section>

        </div>
    )

}

export default Profile; 