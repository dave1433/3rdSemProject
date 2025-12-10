export const Card = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            className="
        bg-white
        rounded-2xl
        shadow-[0_12px_32px_rgba(0,0,0,0.16)]
        border border-greyBorder
        flex flex-col
        gap-6
        w-full
        max-w-[420px]
        p-6
        sm:p-8
      "
        >
            {children}
        </div>
    );
};
