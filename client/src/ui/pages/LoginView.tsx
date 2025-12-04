import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Logo } from "../components/Logo";
import type {FormEvent} from "react";


export const LoginView = ({onSubmit}: { onSubmit: (e: FormEvent) => void }) => {
    return (
        <>
            <Logo/>
            <Card>
                <form className="flex flex-col gap-4" onSubmit={onSubmit}>
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
        </>
    );
};
