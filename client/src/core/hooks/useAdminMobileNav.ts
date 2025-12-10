import { useState, useEffect } from "react";

export function useAdminMobileNav() {
    const [open, setOpen] = useState(false);

    const openMenu = () => setOpen(true);
    const closeMenu = () => setOpen(false);

    // Prevent scrolling when menu is open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeMenu();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    return { open, openMenu, closeMenu };
}
