import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotificationsModal.module.css";
import profileIcon from "../../assets/icons/profile.svg";
import { getSocket } from "../../socket";

function formatShortTime(dateStr) {
  if (!dateStr) return "";
  const diffSec = Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}

function getActionText(type) {
  if (type === "like") return "liked your photo.";
  if (type === "comment") return "commented your photo.";
  if (type === "follow") return "started following.";
  return "interacted with you.";
}

function NotificationsModal({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3333/notifications", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch((err) => console.error("Failed to fetch notifications:", err))
      .finally(() => setLoading(false));

    fetch("http://localhost:3333/notifications/read", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});

    const socket = getSocket();
    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket?.on("new_notification", handleNewNotification);
    return () => {
      socket?.off("new_notification", handleNewNotification);
    };
  }, []);

  const handleClickItem = (notif) => {
    onClose();
    if (notif.post?._id) {
      navigate(`/posts/${notif.post._id}`);
    } else if (notif.sender?._id) {
      navigate(`/profile/${notif.sender._id}`);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Notifications</h2>
        <div className={styles.sectionLabel}>New</div>

        <div className={styles.list}>
          {loading ? (
            <p className={styles.emptyText}>Loading...</p>
          ) : notifications.length === 0 ? (
            <p className={styles.emptyText}>No notifications yet.</p>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif._id}
                type="button"
                className={styles.row}
                onClick={() => handleClickItem(notif)}
              >
                <img
                  src={notif.sender?.profileImage || profileIcon}
                  alt={notif.sender?.username || "User"}
                  className={styles.avatar}
                />

                <p className={styles.text}>
                  <span className={styles.username}>
                    {notif.sender?.username}
                  </span>{" "}
                  {getActionText(notif.type)}{" "}
                  <span className={styles.time}>
                    {formatShortTime(notif.createdAt)}
                  </span>
                </p>

                {notif.post?.imageUrl && (
                  <img
                    src={notif.post.imageUrl}
                    alt="Post preview"
                    className={styles.postThumb}
                  />
                )}
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

export default NotificationsModal;