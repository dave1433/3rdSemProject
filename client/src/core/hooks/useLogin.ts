import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

type LoginResponse = {
    token: string;
    role: number;
    userId: string;
};

const API =
    import.meta.env.MODE === "development"
        ? "http://localhost:5237"
        : "https://deadpigeons-api-project.fly.dev";

export const useLogin = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);

            const email = String(formData.get("email") ?? "");
            const password = String(formData.get("password") ?? "");

            if (!email || !password) {
                setError("Please enter both email and password.");
                return;
            }

            const res = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                setError("Invalid email or password.");
                return;
            }

            const data: LoginResponse = await res.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", String(data.role));
            localStorage.setItem("userId", data.userId);

            if (data.role === 1) navigate("/admin");
            else navigate("/player");
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return {
        handleLogin,
        loading,
        error,
    };
};
