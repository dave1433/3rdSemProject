import React, {useEffect} from "react";
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
    const { activeTab, setActiveTab, handleLogout, tabs } = useAdminHeader();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const currentActiveTab = propActiveTab ?? activeTab;

    const handleChangeTab = (tab: string) => {
        if (propOnChangeTab) {
            (propOnChangeTab as React.Dispatch<React.SetStateAction<string>>)(tab);
        } else {
            setActiveTab(tab);
        }
        setMobileOpen(false);
    };
    const openMobile = () => setMobileOpen(true);
    const closeMobile = () => setMobileOpen(false);

    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth > 900) {
                setMobileOpen(false);
            }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);


    return (
        <AdminHeaderView
            activeTab={currentActiveTab}
            tabs={tabs}
            onChangeTab={handleChangeTab}
            onLogout={handleLogout}
            onOpenMobile={openMobile}
            mobileOpen={mobileOpen}
            onCloseMobile={closeMobile}
        />

    );
};
