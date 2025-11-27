import { Input } from "./Input";
import { Button } from "./Button";
import { PhoneInput } from "./PhoneInput";
import { useState } from "react";

export const PlayerForm = () => {
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        password: "",
        role: "2"   // default: Player
    });

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        await fetch("http://localhost:5237/api/player", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName: form.fullName,
                phone: form.phone,
                email: form.email,
                password: form.password,
                role: parseInt(form.role) // backend expects int
            })
        });

        window.dispatchEvent(new Event("player-updated"));

        setForm({
            fullName: "",
            phone: "",
            email: "",
            password: "",
            role: "2" // reset to default: Player
        });
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 w-full">
            <h2 className="text-jerneNavy text-lg font-semibold mb-4">
                Create New User
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                <Input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    label="Name"
                    placeholder="Enter name"
                />

                <PhoneInput
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    label="Phone"
                    placeholder="Enter phone"
                />

                <Input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    label="Email"
                    type="email"
                    placeholder="Enter email"
                />

                <Input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                />

                {/* ROLE SELECT */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                        Role
                    </label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg p-2"
                    >
                        <option value="2">Player</option> {/* Player = 2 */}
                        <option value="1">Admin</option>  {/* Admin = 1 */}
                    </select>
                </div>

                <Button type="submit">Add New User</Button>
            </form>
        </div>
    );
};
