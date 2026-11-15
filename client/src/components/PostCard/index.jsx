import styles from "./PostCard.module.css";
import profileIcon from "../../assets/icons/profile.svg";
import likeIcon from "../../assets/icons/like.svg";
import likedIcon from "../../assets/icons/liked.svg";
import commentIcon from "../../assets/icons/comment.svg";
import UserLink from "../UserLink";

function PostCard({ post, currentUserId, onLike, onFollow, onOpenDetail }) {
  const isFollowing = post.author.followers?.includes(currentUserId);
  const isMyPost = post.author._id === currentUserId;
  const isLiked = post.likes?.includes(currentUserId);

  return (
    <article className={styles.postCard} onClick={onOpenDetail}>
      <div className={styles.postHeader}>
        <div className={styles.authorInfo}>
          <UserLink userId={post.author._id} className={styles.authorInfo}>
            <img src={post.author.profileImage || profileIcon} alt="Avatar" className={styles.avatar} />
            <span className={styles.username}>{post.author.username}</span>
            <span>•</span>
          </UserLink>
        </div>
        {!isMyPost && (
          <button className={styles.followBtn} onClick={(e) => onFollow(post.author._id, e)}>
            {isFollowing ? "following" : "follow"}
          </button>
        )}
      </div>

      <div className={styles.imageContainer}>
        <img src={post.imageUrl} alt="Post content" className={styles.postImage} />
      </div>

      <div className={styles.postActions}>
        <button className={styles.actionBtn} onClick={(e) => onLike(post._id, e)}>
          <img src={isLiked ? likedIcon : likeIcon} alt="Like" className={styles.actionIcon} />
        </button>
        <button className={styles.actionBtn} onClick={onOpenDetail}>
          <img src={commentIcon} alt="Comment" className={styles.actionIcon} />
        </button>
      </div>

      <div className={styles.likesCount}>
        {post.likes?.length || 0} likes
      </div>
    </article>
  );
}
export default PostCard; 