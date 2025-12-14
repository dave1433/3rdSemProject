import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import "../css/PlayerPageHeader.css";
import { User, LogOut, Menu, X } from "lucide-react";

interface PlayerPageHeaderProps {
    userName: string;
    balance?: number | null;
}

const navItems = [
    { label: "Board", path: "/player/board" },
    { label: "History", path: "/player/history" },
    { label: "Results", path: "/player/results" },
    { label: "My Transactions", path: "/player/transactions" },
];

export const PlayerPageHeader: React.FC<PlayerPageHeaderProps> = ({
                                                                      userName,
                                                                      balance,
                                                                  }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        navigate("/");
    }

    // close menu when route changes
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const balanceLabel =
        balance == null ? "Balance: 0 DKK" : `Balance: ${balance} DKK`;

    return (
        <header className="player-header">
            {/* LEFT: logo + burger */}
            <div className="player-header_left">
                <div className="player-header_logo">
                    <img src="../../../src/assets/logo1.png" alt="Jerne IF" />
                </div>

                {/* Burger button (mobile only via CSS) */}
                <button
                    type="button"
                    className="player-header_burger"
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* DESKTOP NAV */}
            <nav className="player-header_nav player-header_nav--desktop">
                <ul className="player-header_nav-list">
                    {navItems.map((item) => (
                        <li key={item.path} className="player-header_nav-item">
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

            {/* USER CARD */}
            <div className="player-header_user-card">
                <div className="player-header_user-avatar">
                    <User size={20} />
                </div>
                <div className="player-header_user-text">
                    <div className="player-header_user-name">{userName}</div>
                    <div className="player-header_user-balance">{balanceLabel}</div>
                </div>
            </div>

            <button
                type="button"
                className="player-header_logout-btn"
                onClick={handleLogout}
                aria-label="Log out"
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
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="player-header_mobile-link"
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>

            {/* BACKDROP */}
            {menuOpen && (
                <div
                    className="player-header_backdrop"
                    onClick={() => setMenuOpen(false)}
                />
            )}
        </header>
    );
};
