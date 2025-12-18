interface LogoProps {
    className?: string;
    alt?: string;
}

export const Logo = ({
                         className = "",
                         alt = "Jerne IF Logo",
                     }: LogoProps) => {
    return (
        <img
            src="/logo1.png"
            alt={alt}
            loading="eager"
            draggable={false}
            className={`logo ${className}`}
        />
    );
};
