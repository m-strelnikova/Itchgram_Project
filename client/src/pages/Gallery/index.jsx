import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Gallery.module.css"

function Gallery() {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch("http://localhost:3333/posts");
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Failed to load posts");

                const sorteredPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setPosts(sorteredPosts);
            } catch (err) {
                console.error(err);
                setError("Failed to load posts. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();

    }, [])

    return (
        <div className={styles.galleryContainer}>
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

        </div>
    )
}

export default Gallery;