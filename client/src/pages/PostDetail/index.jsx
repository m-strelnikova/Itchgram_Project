import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import styles from "./PostDetail.module.css";
import closeIcon from "../../assets/icons/close.svg";
import likeIcon from "../../assets/icons/like.svg";
import likedIcon from "../../assets/icons/liked.svg";
import commentIcon from "../../assets/icons/comment.svg";
import profileIcon from "../../assets/icons/profile.svg";
import UserLink from "../../components/UserLink";

function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [copied, setCopied] = useState(false);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    fetch(`http://localhost:3333/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error(err));
  }, [postId]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPost((prev) => ({
        ...prev,
        likes: data.likes
      }));
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/users/${post.author._id}/follow`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPost((prev) => ({
        ...prev,
        author: {
          ...prev.author,
          followers: data.followers
        }
      }));
    } catch (err) {
      console.error("Follow error:", err);
    }
  };


  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPost(data);
      setCommentText("");
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!post) return null;

  const isLiked = post.likes?.includes(currentUserId);
  const isFollowing = post.author.followers?.includes(currentUserId);
  const isMyPost = post.author._id === currentUserId;

  return (
    <div className={styles.overlay} onClick={() => navigate(-1)}>
      <button className={styles.closeBtn} onClick={() => navigate(-1)}>
        <img src={closeIcon} alt="Close" />
      </button>

      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageSection}>
          <img src={post.imageUrl} alt="Post" />
        </div>

        <div className={styles.contentSection}>

          <div className={styles.header}>
            <div className={styles.authorInfo}>
              <UserLink userId={post.author._id} className={styles.authorInfo}>
                <img
                  src={post.author.profileImage || profileIcon}
                  alt="Avatar"
                  className={styles.avatar}
                />
                <span className={styles.username}>{post.author.username}</span>
                <span>•</span>
              </UserLink>
              {!isMyPost && (
                <button className={styles.copyLinkBtn} onClick={handleFollow}>
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
            <button className={styles.copyLinkBtn} onClick={handleCopyLink}>
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>

          <div className={styles.commentsList}>
            {post.caption && (
              <div className={styles.commentItem}>
                <img
                  src={post.author.profileImage || profileIcon}
                  alt="Avatar"
                  className={styles.avatar}
                />
                <div className={styles.commentContent}>
                  <span className={styles.username}>{post.author.username}</span>
                  <p className={styles.commentText}>{post.caption}</p>
                </div>
              </div>
            )}

            {post.comments?.map((c, index) => (
              <div key={index} className={styles.commentItem}>
                <UserLink userId={c.user?._id} className={styles.commentItem}>
                  <img
                    src={c.user?.profileImage || profileIcon}
                    alt="Avatar"
                    className={styles.avatar}
                  />
                  <div className={styles.commentContent}>
                    <span className={styles.username}>{c.user?.username}</span>
                    <p className={styles.commentText}>{c.text}</p>
                  </div>
                </UserLink>
              </div>
            ))}
          </div>

          <div className={styles.footerSection}>
            <div className={styles.actions}>
              <button className={styles.actionBtn} onClick={handleLike}>
                <img src={isLiked ? likedIcon : likeIcon} alt="Like" />
              </button>
              <button className={styles.actionBtn}>
                <img src={commentIcon} alt="Comment" />
              </button>
            </div>
            <div className={styles.likesCount}>{post.likes?.length || 0} likes</div>

            <form className={styles.commentForm} onSubmit={handleAddComment}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
              <button type="submit" className={styles.sendBtn}>Post</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;