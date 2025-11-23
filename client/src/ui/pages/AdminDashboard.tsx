import { DefaultLayout } from "../layout/DefaultLayout";

import {AdminHeader} from "../components/AdminHeader.tsx";
import {PlayerForm} from "../components/PlayerForm.tsx";
import {PlayerList} from "../components/PlayerList.tsx";
import {TransactionList} from "../components/TransactionList.tsx";
import {WinningNumbersCard} from "../components/WinningNumbersCard.tsx";

export const AdminDashboard = () => {
    return (
        <DefaultLayout>
            <AdminHeader />

            {/* Two-column layout */}
            <div className="w-full max-w-[1500px] xl:max-w-[1700px] mx-auto flex gap-12 py-12 px-6">

                {/* Left column: Create player */}
                <div className="w-[35%]">
                    <PlayerForm />
                </div>

                {/* Right column: Player list */}
                <div className="w-[65%]">
                    <PlayerList />
                </div>
                <TransactionList/>
            </div>

            {/* Transactions section */}
            <div className="w-full max-w-[1500px] xl:max-w-[1700px] mx-auto px-6 pb-20">
                <WinningNumbersCard/>
            </div>
        </DefaultLayout>
    );
};
