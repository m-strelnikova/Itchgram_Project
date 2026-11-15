import styles from "./Footer.module.css"

function Footer ({handleNavClick}) {
 return (
    <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <button onClick={() => handleNavClick("Home")}>Home</button>
            <button onClick={() => handleNavClick("Search")}>Search</button>
            <button onClick={() => handleNavClick("Explore")}>Explore</button>
            <button onClick={() => handleNavClick("Messages")}>Messages</button>
            <button onClick={() => handleNavClick("Notifications")}>Notifications</button>
            <button onClick={() => handleNavClick("Create")}>Create</button>
          </div>
          <p className={styles.copyright}>© 2026 ICHgram</p>
        </footer>
 )
}

export default Footer;