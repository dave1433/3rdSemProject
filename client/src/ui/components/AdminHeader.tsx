export const AdminHeader = () => {
    return (
        <header className="w-full bg-jerneNavy text-white py-4 px-8 flex-justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
            <img src="assets/logo1.png" className="w=12" alt="Jerne IF Logo"/>
            <span className="font-semibold text-lg">Admin Dasahboard</span>
        </div>

        <div className="flex items-center gap-3">
            <span className="font-medium">Admin User</span>
        <div className="w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center">
            👤
        </div>
        </div>
        </header>
    );
};