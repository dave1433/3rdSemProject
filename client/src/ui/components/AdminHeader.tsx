import { Logo } from "./Logo.tsx";
import { useNavigate } from "react-router";
import { User, LogOut } from "lucide-react";
import "../css/AdminHeader.css";

interface AdminHeaderProps {
    activeTab: string;
    onChangeTab: (tab: string) => void;
}

export const AdminHeader = ({ activeTab, onChangeTab }: AdminHeaderProps) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    const tabs = [
        { id: "players", label: "Users" },
        { id: "game", label: "Game Control" },
        { id: "transactions", label: "Transactions" },
        { id: "history", label: "History" }
    ];

    return (
        <header className="admin-header">

            {/* LEFT: LOGO */}
            <div className="admin-header_logo">
                <Logo />
            </div>

            {/* CENTER NAVIGATION */}
            <nav className="admin-header_nav">
                <ul className="admin-header_nav-list">
                    {tabs.map((t) => (
                        <li key={t.id} className="admin-header_nav-item">
                            <button
                                onClick={() => onChangeTab(t.id)}
                                className={
                                    activeTab === t.id
                                        ? "admin-header_nav-link admin-header_nav-link--active"
                                        : "admin-header_nav-link"
                                }
                            >
                                {t.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* RIGHT: USER CARD + LOGOUT */}
            <div className="admin-header_user-card">
                <div className="admin-header_user-avatar">
                    <User size={18} />
                </div>

                <div className="admin-header_user-text">
                    <div className="admin-header_user-name">Admin User</div>
                </div>

                <button
                    className="admin-header_logout-btn"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};
