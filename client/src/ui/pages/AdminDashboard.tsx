import { DefaultLayout } from "../layout/DefaultLayout";

import {AdminHeader} from "../components/AdminHeader.tsx";
import {PlayerForm} from "../components/PlayerForm.tsx";
import {PlayerList} from "../components/PlayerList.tsx";

export const AdminDashboard = () => {
    return (
        <DefaultLayout>
            <AdminHeader />

            {/* Two-column layout */}
            <div className="w-full max-w-[1200px] mx-auto flex gap-8 py-12">

                {/* Left column: Create player */}
                <div className="w-[35%]">
                    <PlayerForm />
                </div>

                {/* Right column: Player list */}
                <div className="w-[65%]">
                    <PlayerList />
                </div>

            </div>

            {/* Winning numbers section */}
            <div className="w-full max-w-[1200px] mx-auto pb-20">

            </div>
        </DefaultLayout>
    );
};
