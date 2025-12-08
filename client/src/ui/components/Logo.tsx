interface LogoProps {
    size?: number;
    className?: string;
    alt?: string;
}

export const Logo = ({
                         size = 48,
                         className = "",
                         alt = "Jer ne IF Logo",
                     }: LogoProps) => {
    return (
        <img
            src="/logo1.png"
            alt={alt}
            width={size}
            height={size}
            loading="eager"
            draggable={false}
            className={`object-contain select-none ${className}`}
        />
    );
};
