import { Input } from "./Input";
import { Button } from "./Button";
import { PhoneInput } from "./PhoneInput";
import { useState } from "react";

export const PlayerForm = () => {
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: ""
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        await fetch("http://localhost:5237/api/player", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });

        // Tell PlayerList that new data exists
        window.dispatchEvent(new Event("player-updated"));

        setForm({ fullName: "", phone: "", email: "", password: "" });
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 w-full">
            <h2 className="text-jerneNavy text-lg font-semibold mb-4">Create New Player</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input name="fullName" value={form.fullName} onChange={handleChange} label="Name" placeholder="Enter player name" />
                <PhoneInput name="phone" value={form.phone} onChange={handleChange} label="Phone Number" placeholder="Nordic number" />
                <Input name="email" value={form.email} onChange={handleChange} label="Email" type="email" placeholder="Enter player email" />
                <Input name="password" value={form.password} onChange={handleChange} label="Password" type="password" placeholder="Enter player password" />

                <Button type="submit">Add New Player</Button>
            </form>
        </div>
    );
};
