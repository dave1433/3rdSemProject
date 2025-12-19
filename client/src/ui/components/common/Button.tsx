import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

export const Button = ({ children, ...props }: ButtonProps) => {
    return (
        <button
            {...props}
            className="
                w-full h-12 rounded-lg bg-jerneRed
                text-white text-base font-medium
                hover:bg-red-700
                active:bg-red-800
                disabled:opacity-60 disabled:cursor-not-allowed
                transition
            "
        >
            {children}
        </button>
    );
};
