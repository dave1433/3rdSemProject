import React from "react";
import { usePlayerHeader } from "../../core/hooks/usePlayerHeader";
import { PlayerPageHeaderView } from "./PlayerPageHeaderView";

export const PlayerPageHeader: React.FC = () => {
    const {
        menuOpen,
        toggleMenu,
        closeMenu,
        handleLogout,
        userName,
        balance,
        loading
    } = usePlayerHeader();

    return (
        <PlayerPageHeaderView
            menuOpen={menuOpen}
            onToggleMenu={toggleMenu}
            onCloseMenu={closeMenu}
            onLogout={handleLogout}
            userName={userName}
            balance={balance}
            loading={loading}
        />
    );
};
