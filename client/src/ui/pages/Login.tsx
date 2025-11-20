
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card } from "../components/Card";


export const Login = () => {

    return (
        <div className="min-h-screen bg-lightBG flex flex-col justify-center items-center">

            {/* Logo */}
            <img
                src={"src/assets/logo1.png"}
                alt="Jerne IF Logo"
                className="w-28 mb-10"
            />

            <Card>
                <form className="flex flex-col gap-4">

                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        required

                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        required

                    />

                    <Button type="submit">
                        Login
                    </Button>

                </form>

                <p className="text-center text-sm text-jerneNavy hover:underline cursor-pointer">
                    Forgot password?
                </p>

            </Card>
        </div>
    );
};
