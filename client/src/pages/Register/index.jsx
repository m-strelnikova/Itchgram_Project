import { useState } from "react";
import { Link, useNavigate } from "react-router";
import styles from "./Register.module.css";
import ichgram from "../../assets/icons/ichgram.svg";

function Register() {
    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError("Password must be at least 10 characters long and contain uppercase, lowercase, number, and special character.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("http://localhost:3333/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed");
                setLoading(false);
                return;
            }

            navigate("/login");
            
        } catch (err) {
            console.error(err);
            setError("Server is unavailable. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.main}>
            <div className={styles.wrapper}>

                <div className={styles.formColumn}>

                    <div className={styles.card}>
                        <div className={styles.logoBox}>
                            <img src={ichgram} alt="logo Ichgram" className={styles.logoImg} />
                        </div>

                        <p className={styles.subtitle}>
                            Sign up to see photos and videos from your friends.
                        </p>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                className={styles.input}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                className={styles.input}
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                className={styles.input}
                                value={formData.username}
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

                            <p className={styles.infoText}>
                                People who use our service may have uploaded your contact
                                information to Instagram. <a href="#learn">Learn More</a>
                            </p>
                            <p className={styles.infoText}>
                                By signing up, you agree to our <a href="#terms">Terms</a>,{" "}
                                <a href="#privacy">Privacy Policy</a> and{" "}
                                <a href="#cookies">Cookies Policy</a>.
                            </p>

                            <button type="submit" className={styles.button} disabled={loading}>
                                {loading ? "Signing up..." : "Sign up"}
                            </button>
                        </form>
                    </div>

                    <div className={styles.switchCard}>
                        Have an account?
                        <Link to="/login" className={styles.switchLink}>
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Register;