import "../css/AdminCSS/AdminMobileNav.css";

interface Props {
    open: boolean;
    onClose: () => void;
    onSelectTab: (tab: string) => void;
}

export const AdminMobileNavView = ({ open, onClose, onSelectTab }: Props) => {
    if (!open) return null;

    const handleClick = (tab: string) => {
        onSelectTab(tab);
        onClose();
    };

    return (
        <nav className="admin-mobile-menu">
            <button onClick={() => handleClick("players")}>Players</button>
            <button onClick={() => handleClick("game")}>Game Control</button>
            <button onClick={() => handleClick("transactions")}>Transactions</button>
            <button onClick={() => handleClick("history")}>History</button>

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
