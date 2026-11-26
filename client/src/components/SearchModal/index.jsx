import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchModal.module.css";
import profileIcon from "../../assets/icons/profile.svg";
import cancelIcon from "../../assets/icons/cancel.svg";


function getInitialRecentUsers(storageKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function SearchModal({ onClose }) {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId") || "guest";
  const recentStorageKey = `recentSearches_${currentUserId}`;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recentUsers, setRecentUsers] = useState(() =>
    getInitialRecentUsers(recentStorageKey)
  );
  const [loading, setLoading] = useState(false);

  const handleQueryChange = (e) => {
    const nextValue = e.target.value;
    setQuery(nextValue);

    if (!nextValue.trim()) {
      setResults([]);
      setLoading(false);
    }
  };

  const handleClearQuery = () => {
    setQuery("");
    setResults([]);
    setLoading(false);
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      if (!cancelled) {
        setLoading(true);
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3333/users/search?q=${encodeURIComponent(trimmed)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Search failed");

        if (!cancelled) {
          setResults(data);
        }
      } catch (err) {
        console.error("Search users error:", err);
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelectUser = (user) => {
    const updatedRecent = [
      user,
      ...recentUsers.filter((item) => item._id !== user._id)
    ].slice(0, 8);

    setRecentUsers(updatedRecent);
    localStorage.setItem(recentStorageKey, JSON.stringify(updatedRecent));

    onClose();
    navigate(`/profile/${user._id}`);
  };

  const listToRender = query.trim() ? results : recentUsers;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Search</h2>

        <div className={styles.searchBox}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search"
            value={query}
            onChange={handleQueryChange}
            autoFocus
          />
          {query && (
            <button
              type="button"
               className={styles.clearBtn}
              onClick={handleClearQuery}
              aria-label="Clear search"
            >
              <img src={cancelIcon} alt="cancel" className={styles.clearIcon}/>
            </button>
          )}
        </div>

        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            {query.trim() ? "Results" : "Recent"}
          </span>
        </div>

        <div className={styles.resultsList}>
          {loading ? (
            <p className={styles.statusText}>Searching...</p>
          ) : listToRender.length === 0 ? (
            <p className={styles.statusText}>
              {query.trim() ? "No users found." : "No recent searches."}
            </p>
          ) : (
            listToRender.map((user) => (
              <button
                key={user._id}
                type="button"
                className={styles.userRow}
                onClick={() => handleSelectUser(user)}
              >
                <img
                  src={user.profileImage || profileIcon}
                  alt={user.username}
                  className={styles.avatar}
                />
                <div className={styles.userMeta}>
                  <span className={styles.username}>{user.username}</span>
                  {user.fullName && (
                    <span className={styles.fullName}>{user.fullName}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

export default SearchModal;