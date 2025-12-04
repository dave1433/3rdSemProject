import {usePlayerForm} from "../../core/hooks/usePlayerForm.ts";
import {PlayerFormView} from "./PlayerFormView.tsx";

export const PlayerForm = () => {
    const { form, handleChange, handleSubmit } = usePlayerForm();

    return (
        <PlayerFormView
        form={form}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        />
    );
};