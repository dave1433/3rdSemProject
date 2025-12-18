import { Outlet, Navigate } from "react-router";
import { PlayerPageHeader } from "../components/PlayerPageHeader.tsx";
import { useCurrentUser } from "../../core/hooks/useCurrentUser.ts";

export default function PlayerRootLayout() {
    const { user, loading } = useCurrentUser();

    if (loading) {
        return <div className="p-6">Loading…</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <PlayerPageHeader />
            <Outlet />
        </>
    );
}
