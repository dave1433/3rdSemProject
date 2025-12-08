import { Input } from "./Input";
import { Button } from "./Button";
import { PhoneInput } from "./PhoneInput";
import { useState } from "react";

import { openapiAdapter } from "../../api/connection";
import { UserClient } from "../../generated-ts-client.ts";

const userClient = openapiAdapter(UserClient);

export const PlayerForm = () => {
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        role: "2",
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        await userClient.createUser({
            fullName: form.fullName,
            phone: form.phone,
            email: form.email,
            password: form.password,
            role: Number(form.role),
        });

        window.dispatchEvent(new Event("player-updated"));

        setForm({ fullName: "", phone: "", email: "", password: "", role: "2" });
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 w-full">
            <h2 className="text-jerneNavy text-lg font-semibold mb-4">Create New User</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input name="fullName" label="Name" value={form.fullName} onChange={handleChange} />
                <PhoneInput name="phone" label="Phone" value={form.phone} onChange={handleChange} />
                <Input name="email" label="Email" value={form.email} onChange={handleChange} />
                <Input name="password" label="Password" type="password" value={form.password} onChange={handleChange} />

                <div>
                    <label className="text-sm font-medium mb-1">Role</label>
                    <select name="role" value={form.role} onChange={handleChange} className="border p-2 rounded-lg">
                        <option value="2">Player</option>
                        <option value="1">Admin</option>
                    </select>
                </div>

                <Button type="submit">Add New User</Button>
            </form>
        </div>
    );
};
