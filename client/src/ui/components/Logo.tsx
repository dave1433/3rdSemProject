import logo from "../../assets/logo1.png"

interface LogoProps {
    size?: number;
    className?: string;
}

export const Logo = ({ size = 48, className=""}: LogoProps) => {

    return (
        <img
            src={logo}
            alt="Jerne IF Logo"
            width={size}
            height={size}
            className={`object-contain ${className}`}
        />
    );
}