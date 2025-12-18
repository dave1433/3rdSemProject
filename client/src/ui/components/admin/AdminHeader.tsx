import React, { useEffect, useState } from "react";
import { AdminHeaderView } from "./sections/AdminHeaderView.tsx";

interface Props {
    activeTab: string;
    onChangeTab: (tab: string) => void;
    headerState: {
        adminName: string;
        handleLogout: () => void;
        tabs: {
            id: string;
            label: string;
            alert?: boolean;
        }[];
    };
}

export const AdminHeader = ({
                                activeTab,
                                onChangeTab,
                                headerState
                            }: Props) => {
    const {
        adminName,
        handleLogout,
        tabs
    } = headerState;

    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const closeIfDesktop = () => {
            if (window.innerWidth > 900) {
                setMobileOpen(false);
            }
        };

        window.addEventListener("resize", closeIfDesktop);
        window.visualViewport?.addEventListener("resize", closeIfDesktop);

        return () => {
            window.removeEventListener("resize", closeIfDesktop);
            window.visualViewport?.removeEventListener("resize", closeIfDesktop);
        };
    }, []);

    return (
        <AdminHeaderView
            activeTab={activeTab}
            tabs={tabs}
            adminName={adminName}
            onChangeTab={onChangeTab}
            onLogout={handleLogout}
            onOpenMobile={() => setMobileOpen(true)}
            onCloseMobile={() => setMobileOpen(false)}
            mobileOpen={mobileOpen}
        />
    );
};
