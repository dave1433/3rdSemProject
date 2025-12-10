import "../css/AdminCSS/AdminMobileNav.css";

interface Props {
    open: boolean;
    onClose: () => void;
    onSelectTab: (tab: string) => void;
}

export const AdminMobileNavView = ({ open, onClose, onSelectTab }: Props) => {
    const handleClick = (tab: string) => {
        onSelectTab(tab);  // change admin tab
        onClose();         // close drawer
    };

    return (
        <>
            <div
                className={`admin-mobile-backdrop ${open ? "open" : ""}`}
                onClick={onClose}
            />

            <aside className={`admin-mobile-nav ${open ? "open" : ""}`}>
                <div className="admin-mobile-nav__header">
                    <strong>Admin Menu</strong>
                </div>

                <nav className="admin-mobile-nav__menu">
                    <button onClick={() => handleClick("players")}>Players</button>
                    <button onClick={() => handleClick("game")}>Game Control</button>
                    <button onClick={() => handleClick("transactions")}>Transactions</button>
                    <button onClick={() => handleClick("history")}>History</button>
                </nav>

                <button
                    className="admin-mobile-nav__logout"
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }}
                >
                    Log out
                </button>
            </aside>
        </>
    );
};
