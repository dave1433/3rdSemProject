import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";

export const AdminLayout = () => {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            navigate("/login");
            return;
        }

        if (role !== "1") {
            navigate("/player");
            return;
        }

        setAuthorized(true);
    }, [navigate]);

    if (authorized === null) return null;

    return (
        <div className="admin-layout">
            <Outlet />
        </div>
    );
};
