import React from "react";


export const DefaultLayout= ({ children }:{ children: React.ReactNode})=> {
    return (<div className="
    min-h-screen
    bg-lightBG
    flex
    flex-col
    items-center
    ">
            {children}
    </div>
    );
};
