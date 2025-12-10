import { Logo } from "./Logo";
import { User, LogOut, Menu, X } from "lucide-react";
import { AdminMobileNavView } from "./AdminMobileNavView";
import "../css/AdminHeader.css";

interface Props {
    activeTab: string;
    tabs: { id: string; label: string }[];
    onChangeTab: (tab: string) => void;
    onLogout: () => void;
    onOpenMobile: () => void;
    onCloseMobile: () => void;
    mobileOpen: boolean;
}

export const AdminHeaderView = ({
                                    activeTab,
                                    tabs,
                                    onChangeTab,
                                    onLogout,
                                    onOpenMobile,
                                    onCloseMobile,
                                    mobileOpen
                                }: Props) => {
    return (
        <header className="admin-header">

            {/* LEFT: LOGO */}
            <div className="admin-header_logo">
                <button
                    className="admin-header_mobile-btn"
                    onClick={mobileOpen ? onCloseMobile : onOpenMobile}
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Logo />
            </div>

            {/* CENTER: DESKTOP NAV */}
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
                <button
                    className="admin-header_logout-btn"
                    onClick={onLogout}
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* 👇 MOBILE DROPDOWN (Player-style) */}
            <AdminMobileNavView
                open={mobileOpen}
                onClose={onCloseMobile}
                onSelectTab={onChangeTab}
            />

        </header>
    );
};
