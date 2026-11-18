import { useState, useEffect } from "react";
import styles from "./CreatePostModal.module.css";
import profileIcon from "../../assets/icons/profile.svg";
import export_logo from "../../assets/icons/exportfiles.svg"

function CreatePostModal({ onClose, onPostCreated }) {
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [caption, setCaption] = useState("");
    const [loading, setLoading] = useState(false);

    //   const username = localStorage.getItem("username") || "user";
    //   const profileImage = localStorage.getItem("profileImage") || profileIcon;

    const currentUserId = localStorage.getItem("userId");
    const [username, setUsername ] = useState("");
    const [profileImage, setProfileImage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`http://localhost:3333/users/${currentUserId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                return setProfileImage(data.profileImage || profileIcon) & setUsername(data.username);
            })
            .catch((err) => console.error("Failed to load user profile:", err));
    }, [currentUserId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!imageFile) return;
        setLoading(true);


        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("caption", caption);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3333/posts", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to create post");

            onPostCreated(data);
            onClose();
        } catch (err) {
            console.error("Create post error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Create new post</h3>
                    <button
                        className={styles.shareBtn}
                        onClick={handleSubmit}
                        disabled={!imageFile || loading}
                    >
                        {loading ? "Sharing..." : "Share"}
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.imageSection}>
                        {preview ? (
                            <img src={preview} alt="Preview" className={styles.previewImage} />
                        ) : (
                            <label className={styles.uploadLabel}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleImageChange}
                                />
                                <img src={export_logo} alt="Select files from computer" />
                            </label>
                        )}
                    </div>

                    <div className={styles.sidebarSection}>
                        <div className={styles.userInfo}>
                            <img src={profileImage} alt="Avatar" className={styles.avatar} />
                            <span className={styles.username}>{username}</span>
                        </div>
                        <textarea
                            className={styles.captionInput}
                            placeholder="Write a caption..."
                            maxLength={200}
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                        <div className={styles.charCounter}>{caption.length}/200</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePostModal;