import styles from "./Sidebar.module.css";
import ichgramLogo from "../../assets/icons/ichgram.svg";
import homeIcon from "../../assets/icons/home.svg";
import searchIcon from "../../assets/icons/search.svg";
import exploreIcon from "../../assets/icons/explore.svg";
import messagesIcon from "../../assets/icons/messages.svg";
import notificationsIcon from "../../assets/icons/notifications.svg";
import createIcon from "../../assets/icons/create.svg";
import profileIcon from "../../assets/icons/profile.svg";

function Sidebar({ onNavClick }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoBox}>
        <img src={ichgramLogo} alt="ICHGRAM" className={styles.logoImg} />
      </div>
      <nav className={styles.navLinks}>
        <button className={styles.navItem} onClick={() => onNavClick("Home")}>
          <img src={homeIcon} alt="Home" className={styles.navIcon} />
          <span className={styles.navText}>Home</span>
        </button>
        <button className={styles.navItem} onClick={() => onNavClick("Search")}>
          <img src={searchIcon} alt="Search" className={styles.navIcon} />
          <span className={styles.navText}>Search</span>
        </button>
        <button className={styles.navItem} onClick={() => onNavClick("Explore")}>
          <img src={exploreIcon} alt="Explore" className={styles.navIcon} />
          <span className={styles.navText}>Explore</span>
        </button>
        <button className={styles.navItem} onClick={() => onNavClick("Messages")}>
          <img src={messagesIcon} alt="Messages" className={styles.navIcon} />
          <span className={styles.navText}>Messages</span>
        </button>
        <button className={styles.navItem} onClick={() => onNavClick("Notifications")}>
          <img src={notificationsIcon} alt="Notifications" className={styles.navIcon} />
          <span className={styles.navText}>Notifications</span>
        </button>
        <button className={styles.navItem} onClick={() => onNavClick("Create")}>
          <img src={createIcon} alt="Create" className={styles.navIcon} />
          <span className={styles.navText}>Create</span>
        </button>
        <button className={styles.navProfile} onClick={() => onNavClick("Profile")}>
          <img src={profileIcon} alt="Profile" className={styles.navIcon}/>
          <span className={styles.navText}>Profile</span>
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar; 