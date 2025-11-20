
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import {DefaultLayout} from "../layout/DefaultLayout.tsx";


export const Login = () => {

    return (
        <DefaultLayout>

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
        </DefaultLayout>
    );
};
