import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import ProfileHeader from "../../components/ProfileHeader";

function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const { openMessageWithUser } = useOutletContext();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    return (
        <div className={styles.profileContainer}>
            <ProfileHeader
                profileUserId={userId}
                postsCount={posts.length}
                onOpenMessageModal={() => openMessageWithUser(userId)}
            />

            <main className={styles.mainSection}>
                {error && <p className={styles.errorText}>{error}</p>}
                {loading && <p className={styles.loadingText}>Loading...</p>}

                <div className={styles.feed}>
                    {posts.map((post) => (
                        <article
                            key={post._id}
                            className={styles.imageContainer}
                            onClick={() => navigate(`/posts/${post._id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <img src={post.imageUrl} alt="Profile feed post" className={styles.postImage} />
                        </article>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Profile;