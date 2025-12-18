import { Input } from "../components/common/Input.tsx";
import { Button } from "../components/common/Button.tsx";
import { Card } from "../components/common/Card.tsx";
import { Logo } from "../components/common/Logo.tsx";
import type { FormEvent } from "react";

interface LoginViewProps {
    onSubmit: (e: FormEvent) => void;
    loading: boolean;
    error: string | null;
}

export const LoginView = ({
                              onSubmit,
                              loading,
                              error,
                          }: LoginViewProps) => {
    return (
        <div className="flex flex-col items-center gap-6 w-full px-4">

            {/* Logo */}
            <div className="mt-4">
                <div className="block lg:hidden">
                    <Logo size={80} />
                </div>
                <div className="hidden lg:block">
                    <Logo size={140} />
                </div>
            </div>

            {/* App Name */}
            <h1 className="text-2xl lg:text-3xl font-bold text-jerneNavy tracking-wide -mt-2 mb-2">
                Dead Pigeons
            </h1>

            <Card>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={onSubmit}
                >
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        required
                        disabled={loading}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        required
                        disabled={loading}
                    />

                    {/* Error slot (reserves space, keeps layout identical) */}
                    <div className="min-h-[0px]">
                        {error && (
                            <div
                                role="alert"
                                className="
                                    rounded-md
                                    border border-red-200
                                    bg-red-50
                                    px-3 py-2
                                    text-sm text-red-700
                                "
                            >
                                {error}
                            </div>
                        )}
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? "Logging in…" : "Login"}
                    </Button>
                </form>
            </Card>
        </div>
    );
};
