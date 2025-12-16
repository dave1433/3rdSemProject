import React, { useEffect, useState } from "react";
import { useAdminHeader } from "../../core/hooks/useAdminHeader";
import { AdminHeaderView } from "./AdminHeaderView";

interface Props {
    activeTab?: string;
    onChangeTab?: React.Dispatch<React.SetStateAction<string>> | ((tab: string) => void);
}

export const AdminHeader = ({
                                activeTab: propActiveTab,
                                onChangeTab: propOnChangeTab
                            }: Props) => {
    const {
        activeTab,
        setActiveTab,
        adminName,   // 👈 kept
        handleLogout,
        tabs
    } = useAdminHeader();

    const [mobileOpen, setMobileOpen] = useState(false);

    const currentActiveTab = propActiveTab ?? activeTab;

    const handleChangeTab = (tab: string) => {
        if (propOnChangeTab) {
            (propOnChangeTab as React.Dispatch<React.SetStateAction<string>>)(tab);
        } else {
            setActiveTab(tab);
        }
        setMobileOpen(false);
    };

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
            activeTab={currentActiveTab}
            tabs={tabs}
            adminName={adminName}
            onChangeTab={handleChangeTab}
            onLogout={handleLogout}
            onOpenMobile={() => setMobileOpen(true)}
            onCloseMobile={() => setMobileOpen(false)}
            mobileOpen={mobileOpen}
        />
    );
};
