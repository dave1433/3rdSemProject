import React from "react";

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            className="
                 min-h-screen
                bg-lightBG
                flex flex-col
                items-center
                px-4

                pt-10            /* Mobile: slight top spacing */
                lg:pt-0          /* Remove mobile padding on desktop */
                lg:justify-center /* Desktop: perfectly centered vertically */
            "
        >
            {children}
    </div>
    );
};
