import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useCurrentUser } from "./useCurrentUser";

export function usePlayerHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const { user, loading, clearUser } = useCurrentUser();

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);


    function toggleMenu() {
        setMenuOpen(v => !v);
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    function handleLogout() {
        localStorage.clear();
        clearUser();
        navigate("/");
    }

    return {
        menuOpen,
        toggleMenu,
        closeMenu,
        handleLogout,
        userName: user?.fullName || "Player",
        balance: user?.balance ?? 0,
        loading
    };
}
