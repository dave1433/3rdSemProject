import { Logo } from "../../common/Logo.tsx";
import { User, LogOut, Menu, X, Bell } from "lucide-react";
import { AdminMobileNavView } from "../AdminMobileNavView.tsx";
import "../../../css/AdminHeader.css";

interface Tab {
    id: string;
    label: string;
    alert?: boolean;
}

interface Props {
    activeTab: string;
    tabs: Tab[];
    adminName: string;
    onChangeTab: (tab: string) => void;
    onLogout: () => void;
    onOpenMobile: () => void;
    onCloseMobile: () => void;
    mobileOpen: boolean;
}

export const AdminHeaderView = ({
                                    activeTab,
                                    tabs,
                                    adminName,
                                    onChangeTab,
                                    onLogout,
                                    onOpenMobile,
                                    onCloseMobile,
                                    mobileOpen
                                }: Props) => {

    // 🔔 derive mobile alert from same source of truth
    const hasPendingTransactions =
        tabs.find(t => t.id === "transactions")?.alert ?? false;

    return (
        <header className="admin-header">
            <div className="admin-header_logo">
                <button
                    className="admin-header_mobile-btn"
                    onClick={mobileOpen ? onCloseMobile : onOpenMobile}
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <Logo />
            </div>

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

                                {t.alert && (
                                    <span className="admin-header-alert">
                                        <Bell size={14} />
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="admin-header_user-card">
                <div className="admin-header_user-avatar">
                    <User size={18} />
                </div>
                <div className="admin-header_user-name">{adminName}</div>
                <button
                    className="admin-header_logout-btn"
                    onClick={onLogout}
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* 👇 mobile menu with same alert logic */}
            <AdminMobileNavView
                open={mobileOpen}
                onClose={onCloseMobile}
                onSelectTab={onChangeTab}
                hasPendingTransactions={hasPendingTransactions}
            />
        </header>
    );
};
