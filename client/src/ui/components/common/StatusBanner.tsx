type StatusType = "error" | "warning" | "success" | "info";

interface Props {
    type: StatusType;
    message: string;
}

export const StatusBanner = ({ type, message }: Props) => {
    if (!message) return null;

    return (
        <div className={`status-banner status-banner--${type}`}>
            {message}
        </div>
    );
};
