interface AdminTabsProps {
    tabs: { id: string; label: string }[];
    active: string;
    onChange: (id: string) => void;
}

export const AdminTabs = ({ tabs, active, onChange }: AdminTabsProps) => {
    return (
        <div
            style={{
                display: "flex",
                gap: "2rem",
                padding: "1rem 2rem",
                borderBottom: "1px solid #ddd",
                fontSize: "1.1rem",
            }}
        >
            {tabs.map((t) => (
                <button
                    key={t.id}
                    onClick={() => onChange(t.id)}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        paddingBottom: "8px",
                        borderBottom: active === t.id ? "3px solid #d22" : "3px solid transparent",
                        color: active === t.id ? "#d22" : "#666",
                        fontWeight: active === t.id ? "600" : "500",
                    }}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
};
