import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfileEdit.module.css";
import profileIcon from "../../assets/icons/profile.svg";
import { disconnectSocket } from "../../socket.js";

function ProfileEdit() {
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem("userId");

    const [username, setUsername] = useState("");
    const [website, setWebsite] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch(`http://localhost:3333/users/${currentUserId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then((res) => res.json())
            .then((data) => {
                setUsername(data.username || "");
                setWebsite(data.website || "");
                setBio(data.bio || "");
                setProfileImage(data.profileImage || "");
                setFullName(data.fullName || "");
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load profile data");
                setLoading(false);
            });
    }, [currentUserId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3333/users/profile/edit", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ username, fullName, website, bio, profileImage })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to update");

            setSuccess(true);
            setTimeout(() => {
                navigate(`/profile/${currentUserId}`);
            }, 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        disconnectSocket();

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login", { replace: true });
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <main className={styles.mainContent}>
            <div className={styles.editContainer}>
                <h1 className={styles.pageTitle}>Edit profile</h1>

                {error && <p className={styles.errorText}>{error}</p>}
                {success && <p className={styles.successText}>Profile updated successfully!</p>}

                <form onSubmit={handleSave} className={styles.form}>
                    <div className={styles.userCard}>
                        <div className={styles.userInfoLeft}>
                            <img
                                src={profileImage || profileIcon}
                                alt="Avatar"
                                className={styles.avatar}
                            />
                            <div className={styles.userTexts}>
                                <span className={styles.cardUsername}>{username}</span>
                                <span className={styles.cardFullName}>{bio || "No bio yet."}</span>
                            </div>
                        </div>

                        <label className={styles.newPhotoBtn}>
                            New photo
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Username</label>
                        <input
                            type="text"
                            value={username}
                            maxLength={26}
                            minLength={2}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            maxLength={26}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={styles.inputField}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Website</label>
                        <input
                            type="text"
                            maxLength={150}
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className={styles.inputField}
                            placeholder="Website"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>About</label>
                        <div className={styles.textareaWrapper}>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={150}
                                className={styles.textareaField}
                            />
                            <span className={styles.charCounter}>{bio.length}/150</span>
                        </div>
                    </div>

                    <button type="submit" className={styles.saveBtn}>
                        Save
                    </button>

                    <button
                        type="button"
                        className={styles.logoutBtn}
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </form>
            </div>
        </main>

    );
}

export default ProfileEdit;