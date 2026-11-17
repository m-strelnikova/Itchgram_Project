import styles from "./Login.module.css";
import login_pic from "../../assets/img/login_pic.png";
import ichgram from "../../assets/icons/ichgram.svg";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

function Login() {

    const [formData, setFormData] = useState({ login: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3333/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "False login or password");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);
            // localStorage.setItem("username", data.username);
            navigate("/");

        } catch (err) {
            console.error("Network error:", err);
            setError("Server connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.main}>
            <div className={styles.wrapper}>
                <div className={styles.imageBox}>
                    <img src={login_pic} alt="picture of the ichgram" />
                </div>

                <div className={styles.formColumn}>
                    <div className={styles.card}>
                        <div className={styles.imageBox}>
                            <img src={ichgram} alt="logo ichgram" />
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="login"
                                placeholder="Username, or email"
                                className={styles.input}
                                value={formData.login}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                className={styles.input}
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            {error && <p className={styles.errorText}>{error}</p>}

                            <button type="submit" className={styles.button} disabled={loading}>
                                {loading ? "Logging in..." : "Log in"}
                            </button>
                        </form>

                        <div className={styles.divider}>
                            <span>OR</span>
                        </div>

                        <Link to="/reset" className={styles.forgotLink}>
                            Forgot password?
                        </Link>
                    </div>

                    <div className={styles.switchCard}>
                        Don&apos;t have an account?
                        <Link to="/register" className={styles.switchLink}>
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;