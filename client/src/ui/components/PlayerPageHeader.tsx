import React from "react";
import { NavLink, useNavigate } from "react-router";
import "../css/PlayerPageHeader.css";

interface PlayerPageHeaderProps {
    userName: string;
}

const navItems = [
    { label: "Board", path: "/player/board" },
    { label: "History", path: "/player/history" },
    { label: "Results", path: "/player/results" },
    { label: "My Balance", path: "/player/balance" },
];

export const PlayerPageHeader: React.FC<PlayerPageHeaderProps> = ({ userName }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // TODO: clear auth state / token here if needed
        navigate("/login");
    };

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

            {/* User area */}
            <div className="player-header_user">
                {/* top line: greeting */}
                <span className="player-header_user-label">Welcome back!</span>

                {/* second line: name + logout button */}
                <div className="player-header_user-bottom">
                    <span className="player-header_user-name">{userName}</span>
                    <button
                        type="button"
                        className="player-header_logout-btn"
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </div>
            </div>
        </header>
    );
};
