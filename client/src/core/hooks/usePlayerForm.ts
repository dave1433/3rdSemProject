import { useState, type ChangeEvent, type FormEvent } from "react";
import { apiPost } from "../../api/connection";

export const usePlayerForm = () => {
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        role: "2", // default: Player
    });

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        try {
            const res = await apiPost("/api/user", {
                fullName: form.fullName,
                phone: form.phone,
                email: form.email,
                password: form.password,
                role: Number(form.role),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to create user");
            }

            window.dispatchEvent(new Event("player-updated"));

            setForm({
                fullName: "",
                phone: "",
                email: "",
                password: "",
                role: "2",
            });
        } catch (err) {
            console.error("Create user failed:", err);
            alert("Failed to create user");
        }
    }

    return {
        form,
        handleChange,
        handleSubmit,
    };
};
