import { Bell } from "lucide-react";
import "../css/AdminCSS/AdminMobileNav.css";

interface Props {
    open: boolean;
    onClose: () => void;
    onSelectTab: (tab: string) => void;

    // 🔔 NEW: tells us if there are pending transactions
    hasPendingTransactions?: boolean;
}

export const AdminMobileNavView = ({
                                       open,
                                       onClose,
                                       onSelectTab,
                                       hasPendingTransactions
                                   }: Props) => {
    if (!open) return null;

    const handleClick = (tab: string) => {
        onSelectTab(tab);
        onClose();
    };

    return (
        <nav className="admin-mobile-menu">
            <button onClick={() => handleClick("players")}>
                Players
            </button>

            <button onClick={() => handleClick("game")}>
                Game Control
            </button>

            <button onClick={() => handleClick("transactions")}>
                <span className="admin-mobile-tab">
                    Transactions

                    {hasPendingTransactions && (
                        <span className="admin-mobile-alert">
                            <Bell size={18} />
                        </span>
                    )}
                </span>
            </button>

            <button onClick={() => handleClick("history")}>
                History
            </button>

            <button
                className="admin-mobile-logout"
                onClick={() => {
                    localStorage.clear();
                    window.location.href = "/login";
                }}
            >
                Log out
            </button>
        </nav>
    );
};
