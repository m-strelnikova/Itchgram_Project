import { useState } from "react";
import { Link } from "react-router";
import styles from "./Reset.module.css";
import ichgram from "../../assets/icons/ichgram.svg";
import reset_login from "../../assets/icons/reset_login.svg";

function ResetPassword() {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3333/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    emailOrUsername,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "User not found");
                setLoading(false);
                return;
            }

            setMessage("Password successfully updated! You can now log in.");
            setEmailOrUsername("");
            setNewPassword("");
        } catch (err) {
            console.error(err);
            setError("Server is unavailable. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.main}>
            <header className={styles.topHeader}>
                <Link to="/login" className={styles.topLogoBox}>
                    <img src={ichgram} alt="logo Ichgram" className={styles.topLogoImg} />
                </Link>
            </header>

            <div className={styles.wrapper}>
                <div className={styles.formColumn}>
                    <div className={styles.card}>
                        <div className={styles.lockIcon}>
                            <img src={reset_login} alt="logo lock"/>
                        </div>

                        <h2 className={styles.resetTitle}>Trouble logging in?</h2>
                        <p className={styles.resetDesc}>
                            Enter your email, phone, or username and set a new password to get back into your account.
                        </p>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Email or Username"
                                className={styles.input}
                                value={emailOrUsername}
                                onChange={(e) => setEmailOrUsername(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                className={styles.input}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />

                            {error && <p className={styles.errorText}>{error}</p>}
                            {message && <p className={styles.successText}>{message}</p>}

                            <button type="submit" className={styles.button} disabled={loading}>
                                {loading ? "Updating..." : "Reset your password"}
                            </button>
                        </form>

                        <div className={styles.divider}>
                            <span>OR</span>
                        </div>

                        <Link to="/register" className={styles.createLink}>
                            Create new account
                        </Link>
                    </div>

                    <div className={styles.backToLogin}>
                        <Link to="/login" className={styles.createLink}>
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ResetPassword;