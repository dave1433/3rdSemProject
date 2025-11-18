interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button"|"submit";
}

export const Button = ({children, ...props}: ButtonProps) => {
    return (
        <button {...props} className="
        w-full h-12 rounded-lg bg-#C80000
        text-white text-base font-medium
        hover:bg-red-700 active: bg-red-800
        transition">
            {children}
        </button>
    )
}