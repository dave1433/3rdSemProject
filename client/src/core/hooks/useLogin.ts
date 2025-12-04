import { type FormEvent } from "react";
import {useNavigate} from "react-router";

type LoginResponse = {
    token: string;
    role: number;
    userId: string;
};

const API =
    import.meta.env.MODE === "development"
        ? "http://localhost:5237" // LOCAL API
        : "https://deadpigeons-api-project.fly.dev"; // PRODUCTION API

export const useLogin = () => {
    const navigate = useNavigate();

    // synchronous handler matching (e: FormEvent<Element>) => void
    const handleLogin = (e: FormEvent) => {
        e.preventDefault();

        void (async () => {
            try {
                // Safely obtain the form element and its data
                const form = e.currentTarget as HTMLFormElement | null;
                const formData = form ? new FormData(form) : new FormData();
                const email = String(formData.get("email") ?? "");
                const password = String(formData.get("password") ?? "");

                if (!email || !password) {
                    alert("Missing credentials");
                    return;
                }

                const res = await fetch(`${API}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    alert("Invalid login");
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
                alert("An error occurred during login");
            }
        })();
    };

    return { handleLogin };
};
