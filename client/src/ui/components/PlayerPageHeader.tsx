import React from "react";
import { NavLink, useNavigate } from "react-router";
import "../css/PlayerPageHeader.css";
import { User, LogOut } from 'lucide-react';

interface PlayerPageHeaderProps {
    userName: string;
    balance?: number | null;
}

const navItems = [
    { label: "Board", path: "/player/board" },
    { label: "History", path: "/player/history" },
    { label: "Results", path: "/player/results" },
    { label: "My Transactions", path: "/player/balance" },
];

export const PlayerPageHeader: React.FC<PlayerPageHeaderProps> = ({
                                                                      userName, balance,
                                                                  }) => {
    const navigate = useNavigate();

    function handleLogout() {
        // clear whatever you store on login
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");

        navigate("/");
    }

    const balanceLabel =
        balance == null ? "Balance: —" : `Balance: ${balance} DKK`;

    return (
        <header className="player-header">
            {/* Logo */}
            <div className="player-header_logo">
                <img src="../../../src/assets/logo1.png" alt="Jerne IF" />
            </div>

            {/* Navigation */}
            <nav className="player-header_nav">
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

            {/* Right-side user/balance card */}
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
        </header>
    );
};