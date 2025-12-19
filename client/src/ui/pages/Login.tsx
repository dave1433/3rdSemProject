import { useLogin } from "../../core/hooks/useLogin.ts";
import { DefaultLayout } from "../layout/DefaultLayout.tsx";
import { LoginView } from "./LoginView.tsx";

export const Login = () => {
    const { handleLogin, loading, error } = useLogin();

    return (
        <DefaultLayout>
            <LoginView
                onSubmit={handleLogin}
                loading={loading}
                error={error}
            />
        </DefaultLayout>
    );
};
