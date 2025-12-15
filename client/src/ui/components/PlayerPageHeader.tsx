import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import "../css/PlayerPageHeader.css";
import { User, LogOut, Menu, X } from "lucide-react";
import { useCurrentUser } from "../../core/hooks/useCurrentUser";

const navItems = [
    { label: "Board", path: "/player/board" },
    { label: "History", path: "/player/history" },
    { label: "Results", path: "/player/results" },
    { label: "My Transactions", path: "/player/transactions" },
];

export const PlayerPageHeader: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const { user, loading, clearUser } = useCurrentUser();

    // close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    function handleLogout() {
        localStorage.clear();
        clearUser();              //  clears global cache + subscribers
        navigate("/");
    }

    const userName = user?.fullName || "Player";
    const balance = user?.balance ?? 0;

    return (
        <header className="player-header">
            {/* LEFT */}
            <div className="player-header_left">
                <div className="player-header_logo">
                    <img src="../../../src/assets/logo1.png" alt="Jerne IF" />
                </div>

                <button
                    type="button"
                    className="player-header_burger"
                    onClick={() => setMenuOpen(v => !v)}
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* DESKTOP NAV */}
            <nav className="player-header_nav player-header_nav--desktop">
                <ul className="player-header_nav-list">
                    {navItems.map(item => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    "player-header_nav-link" +
                                    (isActive ? " player-header_nav-link--active" : "")
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* USER */}
            <div className="player-header_user-card">
                <User size={20} />
                <div className="player-header_user-text">
                    <div className="player-header_user-name">
                        {loading ? "…" : userName}
                    </div>
                    <div className="player-header_user-balance">
                        Balance: {loading ? "…" : balance} DKK
                    </div>
                </div>
            </div>

            <button
                type="button"
                className="player-header_logout-btn"
                onClick={handleLogout}
            >
                <LogOut size={20} />
            </button>

            {/* MOBILE MENU */}
            <div
                className={
                    "player-header_mobile-menu" +
                    (menuOpen ? " player-header_mobile-menu--open" : "")
                }
            >
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="player-header_mobile-link"
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>

            {menuOpen && (
                <div
                    className="player-header_backdrop"
                    onClick={() => setMenuOpen(false)}
                />
            )}
        </header>
    );
};
