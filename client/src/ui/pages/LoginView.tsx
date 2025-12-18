import { Input } from "../components/common/Input.tsx";
import { Button } from "../components/common/Button.tsx";
import { Card } from "../components/common/Card.tsx";
import { Logo } from "../components/common/Logo.tsx";
import type { FormEvent } from "react";

export const LoginView = ({ onSubmit }: { onSubmit: (e: FormEvent) => void }) => {
    return (
        <div className="flex flex-col items-center gap-6 w-full px-4">

            {/* Responsive Logo */}
            <div className="mt-4">
                {/* Mobile */}
                <div className="block lg:hidden">
                    <Logo size={80} />
                </div>

                {/* Desktop */}
                <div className="hidden lg:block">
                    <Logo size={140} />
                </div>
            </div>

            {/* App Name */}
            <h1 className="text-2xl lg:text-3xl font-bold text-jerneNavy tracking-wide -mt-2 mb-2">
                Dead Pigeons
            </h1>

            <Card>
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <Input label="Email" name="email" type="email" required />
                    <Input label="Password" name="password" type="password" required />
                    <Button type="submit">Login</Button>
                </form>
            </Card>
        </div>
    );
};
