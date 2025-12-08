import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DefaultLayout } from "../layout/DefaultLayout";
import { Logo } from "../components/Logo";
import { useNavigate } from "react-router";
import { apiPost } from "../../api/connection";

type LoginResponse = {
    token: string;
    role: number;
    userId: string;
};

export const Login = () => {
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");

        if (!email || !password) {
            alert("Missing credentials");
            return;
        }

        try {
            // ✔ Correct API path
            const res = await apiPost("/api/auth/login", { email, password });

            if (!res.ok) {
                alert("Invalid login");
                return;
            }

            const data: LoginResponse = await res.json();

            // ✔ Save session
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", String(data.role));
            localStorage.setItem("userId", data.userId);

            // ✔ Redirect by role
            navigate(data.role === 1 ? "/admin" : "/player");

        } catch (err) {
            console.error("Login failed:", err);
            alert("Login failed — server error");
        }
    }

    return (
        <DefaultLayout>
            <Logo />
            <Card>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <Input
                        name="email"
                        label="Email"
                        type="email"
                        required
                    />

                    <Input
                        name="password"
                        label="Password"
                        type="password"
                        required
                    />

                    <Button type="submit">Login</Button>
                </form>
            </Card>
        </DefaultLayout>
    );
};
