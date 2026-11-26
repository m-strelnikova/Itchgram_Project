import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MessagesModal.module.css";
import profileIcon from "../../assets/icons/profile.svg";
import { getSocket } from "../../socket";

function formatBubbleTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function MessagesModal({ initialTargetUserId, onClose }) {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [myProfile, setMyProfile] = useState(null);
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  // Загружаем свой профиль для отображения в левой колонке
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!currentUserId) return;

    fetch(`http://localhost:3333/users/${currentUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.message) setMyProfile(data);
      })
      .catch(() => {});
  }, [currentUserId]);

  
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3333/messages/conversations", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setConversations(data);

        if (initialTargetUserId) {
          const found = data.find((c) => c.user._id === initialTargetUserId);
          if (found) {
            setSelectedUser(found.user);
            return;
          }
          fetch(`http://localhost:3333/users/${initialTargetUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then((r) => r.json())
            .then((u) => {
              if (u && u._id) setSelectedUser(u);
            })
            .catch(() => {});
        } else if (data.length > 0) {
          setSelectedUser(data[0].user);
        }
      })
      .catch((err) => console.error("Failed to load conversations:", err));
  }, [initialTargetUserId]);

  
  useEffect(() => {
    if (!selectedUser?._id) return;
    const token = localStorage.getItem("token");

    fetch(`http://localhost:3333/messages/${selectedUser._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch((err) => console.error("Failed to load messages:", err));
  }, [selectedUser]);

  
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      const recipientId =
        typeof msg.recipient === "string" ? msg.recipient : msg.recipient?._id;

      const activeId = selectedUser?._id;
      const belongsToCurrentChat =
        activeId &&
        ((senderId === currentUserId && recipientId === activeId) ||
          (senderId === activeId && recipientId === currentUserId));

      if (belongsToCurrentChat) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }

      const partnerId = senderId === currentUserId ? recipientId : senderId;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.user._id === partnerId);
        if (idx === -1) return prev;
        const updatedItem = {
          ...prev[idx],
          lastMessage: {
            text: msg.text,
            sender: senderId,
            createdAt: msg.createdAt
          }
        };
        const copy = [...prev];
        copy.splice(idx, 1);
        return [updatedItem, ...copy];
      });
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [selectedUser, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !selectedUser?._id) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit(
      "send_message",
      { recipientId: selectedUser._id, text: trimmed },
      (ack) => {
        if (ack?.ok) {
          setInputText("");
        }
      }
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
        <aside className={styles.sidebarList}>
          <div className={styles.myUsernameHeader}>
            {myProfile?.username || "Messages"}
          </div>

          <div className={styles.dialogList}>
            {conversations.map(({ user, lastMessage }) => {
              const isActive = selectedUser?._id === user._id;
              return (
                <button
                  key={user._id}
                  type="button"
                  className={`${styles.dialogItem} ${isActive ? styles.dialogActive : ""}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <img
                    src={user.profileImage || profileIcon}
                    alt={user.username}
                    className={styles.dialogAvatar}
                  />
                  <div className={styles.dialogMeta}>
                    <span className={styles.dialogName}>{user.username}</span>
                    <span className={styles.dialogPreview}>
                      {lastMessage
                        ? `${lastMessage.sender === currentUserId ? "You" : user.username}: ${lastMessage.text}`
                        : "Start a conversation"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className={styles.chatArea}>
          {selectedUser ? (
            <>
              <div className={styles.chatHeader}>
                <img
                  src={selectedUser.profileImage || profileIcon}
                  alt={selectedUser.username}
                  className={styles.headerAvatar}
                />
                <span className={styles.headerUsername}>
                  {selectedUser.username}
                </span>
              </div>

              <div className={styles.messagesScroll}>
                <div className={styles.profileCard}>
                  <img
                    src={selectedUser.profileImage || profileIcon}
                    alt={selectedUser.username}
                    className={styles.cardAvatar}
                  />
                  <div className={styles.cardTitle}>{selectedUser.username}</div>
                  <div className={styles.cardSub}>
                    {selectedUser.fullName || selectedUser.username} · ICHgram
                  </div>
                  <button
                    type="button"
                    className={styles.viewProfileBtn}
                    onClick={() => {
                      onClose();
                      navigate(`/profile/${selectedUser._id}`);
                    }}
                  >
                    View profile
                  </button>
                </div>

                {messages.length > 0 && (
                  <div className={styles.timestampLabel}>
                    {formatBubbleTime(messages[0].createdAt)}
                  </div>
                )}

                <div className={styles.bubblesList}>
                  {messages.map((msg) => {
                    const senderObj =
                      typeof msg.sender === "object" ? msg.sender : null;
                    const senderId = senderObj ? senderObj._id : msg.sender;
                    const isMine = senderId === currentUserId;

                    return (
                      <div
                        key={msg._id}
                        className={`${styles.bubbleRow} ${isMine ? styles.mineRow : styles.otherRow}`}
                      >
                        {!isMine && (
                          <img
                            src={selectedUser.profileImage || profileIcon}
                            alt={selectedUser.username}
                            className={styles.bubbleAvatar}
                          />
                        )}

                        <div
                          className={`${styles.bubble} ${isMine ? styles.mineBubble : styles.otherBubble}`}
                        >
                          {msg.text}
                        </div>

                        {isMine && (
                          <img
                            src={myProfile?.profileImage || profileIcon}
                            alt="Me"
                            className={styles.bubbleAvatar}
                          />
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <form className={styles.inputBar} onSubmit={handleSend}>
                <input
                  type="text"
                  className={styles.messageInput}
                  placeholder="Write message"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </form>
            </>
          ) : (
            <div className={styles.emptyChat}>Select a conversation</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MessagesModal;