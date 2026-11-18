import { useNavigate } from "react-router-dom";

function UserLink({ userId, children, className }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.stopPropagation(); 
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <div onClick={handleClick} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }} className={className}>
      {children}
    </div>
  );
}

export default UserLink;