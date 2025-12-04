import {useLogin} from "../../core/hooks/useLogin.ts";
import {DefaultLayout} from "../layout/DefaultLayout.tsx";
import {LoginView} from "./LoginView.tsx";

export const Login = () => {
    const { handleLogin } = useLogin();
    return (
        <DefaultLayout>
            <LoginView onSubmit={handleLogin}/>
        </DefaultLayout>
    );
};
