import { NavLink } from "react-router";
import { User, LogOut, Menu, X } from "lucide-react";
import "../../css/PlayerPageHeader.css";
import {Logo} from "../common/Logo.tsx";

const navItems = [
    { label: "Board", path: "/player/board" },
    { label: "History", path: "/player/history" },
    { label: "Results", path: "/player/results" },
    { label: "My Transactions", path: "/player/transactions" },
];

interface Props {
    menuOpen: boolean;
    loading: boolean;
    userName: string;
    balance: number;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
    onLogout: () => void;
}

export const PlayerPageHeaderView = ({
                                         menuOpen,
                                         loading,
                                         userName,
                                         balance,
                                         onToggleMenu,
                                         onCloseMenu,
                                         onLogout
                                     }: Props) => {
    return (
        <header className="player-header">
            {/* LEFT */}
            <div className="player-header_left">
                <button
                    type="button"
                    className="player-header_burger"
                    onClick={onToggleMenu}
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                <Logo/>
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
                onClick={onLogout}
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
                        onClick={onCloseMenu}
                    >
                        {item.label}
                    </NavLink>
                ))}
                <button
                    className="player-header_mobile-link player-header_mobile-logout"
                        onClick={onLogout}
                >
                     Log out
                    </button>
            </div>

            {menuOpen && (
                <div
                    className="player-header_backdrop"
                    onClick={onCloseMenu}
                />
            )}
        </header>
    );
};
