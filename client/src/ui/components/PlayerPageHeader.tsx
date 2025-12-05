import React from "react";
import { NavLink } from "react-router";
import "../css/PlayerPageHeader.css";

import logo from "../../assets/logo1.png";

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
    return (
        <header className="player-header">
            {/* Logo */}
            <div className="player-header_logo">
                <img src={logo} alt="Jerne IF" />
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

            {/* User name */}
            <div className="player-header_user">
                <span className="player-header_user-label">Welcome back!</span>
                <span className="player-header_user-name">{userName}</span>
            </div>
        </header>
    );
};
