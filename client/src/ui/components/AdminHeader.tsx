import React from "react";
import { useAdminHeader } from "../../core/hooks/useAdminHeader";
import { useAdminMobileNav } from "../../core/hooks/useAdminMobileNav";
import { AdminHeaderView } from "./AdminHeaderView";
import { AdminMobileNavView } from "./AdminMobileNavView";

interface Props {
    activeTab?: string;
    onChangeTab?: React.Dispatch<React.SetStateAction<string>> | ((tab: string) => void);
}

export const AdminHeader = ({ activeTab: propActiveTab, onChangeTab: propOnChangeTab }: Props) => {
    const { activeTab, setActiveTab, handleLogout, tabs } = useAdminHeader();
    const { open, openMenu, closeMenu } = useAdminMobileNav();

    // prefer props when provided
    const currentActiveTab = propActiveTab ?? activeTab;

    // normalize onChangeTab to a (tab: string) => void function
    const handleChangeTab = (tab: string) => {
        if (propOnChangeTab) {
            // propOnChangeTab may be a state setter or a callback
            (propOnChangeTab as React.Dispatch<React.SetStateAction<string>>)(tab);
        } else {
            setActiveTab(tab);
        }
    };

    return (
        <>
            <AdminHeaderView
                activeTab={currentActiveTab}
                tabs={tabs}
                onChangeTab={handleChangeTab}
                onLogout={handleLogout}
                onOpenMobile={openMenu}
            />

            <AdminMobileNavView
                open={open}
                onClose={closeMenu}
                onSelectTab={handleChangeTab}
            />

        </>
    );
};
