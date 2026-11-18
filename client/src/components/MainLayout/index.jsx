import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.css";
import Footer from "../Footer";
import CreatePostModal from "../CreatePostModal";
import Sidebar from "../Sidebar";

function MainLayout() {
    const [activeModal, setActiveModal] = useState(null);
    const navigate = useNavigate();

    const isPostModalOpen = location.pathname.includes("/posts/");

    const handleNavClick = (menuName) => {
        if (["Search", "Notifications", "Messages", "Create"].includes(menuName)) {
            setActiveModal(activeModal === menuName ? null : menuName);
        } else {
            setActiveModal(null);
            if (menuName === "Home") navigate("/");
            if (menuName === "Profile") {
                const currentUserId = localStorage.getItem("userId");
                navigate(`/profile/${currentUserId}`);
            }
        }
    };
    const closePostModal = () => {
        navigate(-1);
    };
    return (
        <div className={styles.layout}>
            <Sidebar onNavClick={handleNavClick} />

            {activeModal === "Create" ? (
                <CreatePostModal
                    onClose={() => setActiveModal(null)}
                    onPostCreated={(newPost) => {
                        setActiveModal(null);
                        console.log(newPost._id);
                    }}
                />
            ) : activeModal ? (
                <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{activeModal}</h2>
                    </div>
                </div>
            ) : null}


            <div className={styles.contentWrapper}>

                <Outlet context={{ setActiveModal }} />
                <Footer handleNavClick={handleNavClick} />
            </div>

            {isPostModalOpen && (
                <div className={styles.postModalOverlay} onClick={closePostModal}>
                    <div className={styles.postModalContainer} onClick={(e) => e.stopPropagation()}>
                        <Outlet />
                    </div>
                </div>
            )}
        </div >
    );
}

export default MainLayout;