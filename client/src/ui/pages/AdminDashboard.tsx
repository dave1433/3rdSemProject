import { DefaultLayout } from "../layout/DefaultLayout";

import { AdminHeader } from "../components/AdminHeader";
import { PlayerForm } from "../components/PlayerForm";
import { PlayerList } from "../components/PlayerList";
import { TransactionList } from "../components/TransactionList";
import { WinningNumbersCard } from "../components/WinningNumbersCard";
import { DrawHistoryTable } from "../components/DrawHistoryTable";

export const AdminDashboard = () => {
    return (
        <DefaultLayout>
            <AdminHeader />

            <div className="w-full max-w-[1700px] mx-auto px-6 py-10 space-y-12">

                {/* ============================= */}
                {/* ROW 1: User + Players + Transactions */}
                {/* ============================= */}
                <div className="grid grid-cols-12 gap-10">
                    {/* Create new user */}
                    <div className="col-span-12 xl:col-span-3">
                        <PlayerForm />
                    </div>

                    {/* Players list */}
                    <div className="col-span-12 xl:col-span-6">
                        <PlayerList />
                    </div>

                    {/* Transactions */}
                    <div className="col-span-12 xl:col-span-3">
                        <TransactionList />
                    </div>
                </div>

                {/* ============================= */}
                {/* ROW 2: Winning Numbers */}
                {/* ============================= */}
                <WinningNumbersCard />

                {/* ============================= */}
                {/* ROW 3: Draw History */}
                {/* ============================= */}
                <DrawHistoryTable />

            </div>
        </DefaultLayout>
    );
};
