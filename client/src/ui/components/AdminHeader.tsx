import {Logo} from "./Logo.tsx";

export const AdminHeader = () => {
    return (
        <header className="w-full bg-jerneNavy text-white py-4 px-8 flex justify-between  shadow-md">
        <div className="flex items-center gap-3">
            <Logo/>
        </div>

        <div className="flex justify-center gap-3">
            <span className="font-semibold text-xl">Admin Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
            <span className="font-medium">Admin User</span>
        <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            👤
        </div>
        </div>
        </header>
    );
};