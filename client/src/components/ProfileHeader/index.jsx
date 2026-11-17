import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./ProfileHeader.module.css";
import profileIcon from "../../assets/icons/profile.svg";
import circleIcon from "../../assets/icons/circle.svg";
import link from "../../assets/icons/link.svg";

function ProfileHeader({ profileUserId, postsCount, onOpenMessageModal }) {
    const [profileUser, setProfileUser] = useState(null);
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem("userId");

    const isMyProfile = profileUserId === currentUserId;

    useEffect(() => {
        const token = localStorage.getItem("token"); 
        fetch(`http://localhost:3333/users/${profileUserId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => res.json())
            .then((data) => setProfileUser(data))
            .catch((err) => console.error("Failed to load user profile:", err));
    }, [profileUserId]);

    const handleFollow = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3333/users/${profileUserId}/follow`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setProfileUser((prev) => ({
                ...prev,
                followers: data.followers
            }));
        } catch (err) {
            console.error("Follow error:", err);
        }
    };

    if (!profileUser) return null;

    const isFollowing = profileUser.followers?.includes(currentUserId);

    return (
        <header className={styles.headerContainer}>
            <div className={styles.avatarWrapper}>
                <img
                    src={profileUser.profileImage || profileIcon}
                    alt="Avatar"
                    className={styles.avatar}
                />
                <img
                    src={circleIcon}
                    alt="Circle border"
                    className={styles.circleBorder}
                />
            </div>

            <div className={styles.infoSection}>
                <div className={styles.topRow}>
                    <span className={styles.username}>{profileUser.username}</span>

                    {isMyProfile ? (
                        <button
                            className={styles.editProfileBtn}
                            onClick={() => navigate("/profile/edit")}
                        >
                            Edit profile
                        </button>
                    ) : (
                        <div className={styles.actionButtons}>
                            <button
                                className={`${styles.btn} ${isFollowing ? styles.followingBtn : styles.followBtn}`}
                                onClick={handleFollow}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                            <button
                                className={`${styles.btn} ${styles.messageBtn}`}
                                onClick={onOpenMessageModal} 
                            >
                                Message
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.statsRow}>
                    <span><strong>{postsCount}</strong> posts</span>
                    <span><strong>{profileUser.followers?.length || 0}</strong> followers</span>
                    <span><strong>{profileUser.following?.length || 0}</strong> following</span>
                </div>

                <div className={styles.bioSection}>
                    <p className={styles.fullName}>{profileUser.fullName || profileUser.username}</p>
                    <p className={styles.bioText}>{profileUser.bio || "No bio yet."}</p>
                    <div className={styles.linkLine}>
                        <img src={link} alt="link to personal website" />
                        <p className={styles.linkText}>{profileUser.website || ""}</p>
                    </div>
                     
                </div>
            </div>
        </header>
    );
}

export default ProfileHeader;