import { useState } from "react";
import styles from "./PostOptionModal.module.css";

function PostOptionModal({
  post,
  isAuthor,
  onClose,
  onPostUpdated,
  onPostDeleted
}) {
 const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || "");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const postUrl = `${window.location.origin}/posts/${post._id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error("Failed to copy link:", err);
      setError("Could not copy link");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/posts/${post._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ caption })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update post");

      onPostUpdated(data);
      setIsEditing(false);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/posts/${post._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete post");

      onPostDeleted(post._id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {error && <p className={styles.error}>{error}</p>}

        {isEditing ? (
          <form onSubmit={handleSaveEdit} className={styles.editForm}>
            <h3 className={styles.editTitle}>Edit post</h3>
            <textarea
              className={styles.textarea}
              value={caption}
              maxLength={200}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
            />
            <div className={styles.editActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.optionsList}>
            {isAuthor && (
              <>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  className={styles.optionBtn}
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  Edit
                </button>
              </>
            )}

            <button
              type="button"
              className={styles.optionBtn}
              onClick={handleCopyLink}
            >
              {copied ? "Link copied!" : "Copy link"}
            </button>

            <button
              type="button"
              className={styles.cancelActionBtn}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostOptionModal;