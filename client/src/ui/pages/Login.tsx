import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DefaultLayout } from "../layout/DefaultLayout";
import { Logo } from "../components/Logo";
import { useNavigate } from "react-router";

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

        if (!email || !password) return alert("Missing credentials");

        const res = await fetch(
            "https://deadpigeons-api-project.fly.dev/api/auth/login",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            }
        );

        if (!res.ok) return alert("Invalid login");

        const data: LoginResponse = await res.json();

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", String(data.role));
        localStorage.setItem("userId", data.userId);

        navigate(data.role === 1 ? "/admin" : "/player");
    }

    return (
        <DefaultLayout>
            <Logo />
            <Card>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <Input label="Email" name="email" type="email" required />
                    <Input label="Password" name="password" type="password" required />
                    <Button type="submit">Login</Button>
                </form>
            </Card>
        </DefaultLayout>
    );
};
