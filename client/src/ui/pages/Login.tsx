import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { DefaultLayout } from "../layout/DefaultLayout";
import { Logo } from "../components/Logo";
import { useNavigate } from "react-router";

export const Login = () => {
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);

        const email = formData.get("email");
        const password = formData.get("password");

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            alert("Invalid credentials");
            return;
        }

        //const data = await res.json();

        //localStorage.setItem("token", data.token);
        //localStorage.setItem("role", data.role);

        const data: { token: string; role: number; userId: string } = await res.json();

        // store everything we need
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", String(data.role));
        localStorage.setItem("userId", data.userId); // PLAYER / USER ID

        if (data.role === 1) {
            navigate("/admin");
        } else {
            navigate("/player");
        }
    }


    return (
        <DefaultLayout>
            <Logo />
            <Card>
                <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        required
                    />
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        required
                    />

                    <Button type="submit">Login</Button>
                </form>
            </Card>
        </DefaultLayout>
    );
};
