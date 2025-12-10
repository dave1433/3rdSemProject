import { Logo } from "./Logo";
import { User, LogOut } from "lucide-react";
import "../css/AdminHeader.css";

export interface Props {
    activeTab: string;
    onChangeTab: (tab: string) => void;
    tabs: { id: string; label: string }[];
    onLogout: () => void;
    onOpenMobile: () => void;
};

export const AdminHeaderView = ({
                                activeTab,
                                tabs,
                                onChangeTab,
                                onLogout,
                                onOpenMobile
                            }: Props) => {
    return (
        <header className="admin-header">

            {/* LEFT: LOGO */}
            <div className="admin-header_logo">
                <button className="admin-header_mobile-btn" onClick={onOpenMobile}>
                    ☰
                </button>
                <Logo />
            </div>



            {/* CENTER: NAVIGATION */}
            <nav className="admin-header_nav">
                <ul className="admin-header_nav-list">
                    {tabs.map(t => (
                        <li key={t.id}>
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

            {/* RIGHT: USER */}
            <div className="admin-header_user-card">
                <div className="admin-header_user-avatar">
                    <User size={18} />
                </div>

                <div className="admin-header_user-text">
                    <div className="admin-header_user-name">Admin User</div>
                </div>

                <button className="admin-header_logout-btn" onClick={onLogout}>
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};
