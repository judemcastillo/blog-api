import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api, setToken } from "../lib/api.js";

export default function Login() {
	const nav = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });
	async function submit(e) {
		e.preventDefault();
		try {
			const auth = await api("/auth/login", {
				method: "POST",
				body: JSON.stringify(form),
			});
			setToken(auth.token);
			nav("/");
		} catch (err) {
			console.error("Login failed:", err.message);
		}
	}
	return (
		<div className="max-w-sm mx-auto p-4 space-y-3">
			<h1 className="text-2xl font-bold">Login</h1>
			<form onSubmit={submit} className="space-y-2">
				<input
					className="border p-2 rounded w-full"
					placeholder="Email"
					value={form.email}
					onChange={(e) => setForm({ ...form, email: e.target.value })}
				/>
				<input
					type="password"
					className="border p-2 rounded w-full"
					placeholder="Password"
					value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })}
				/>
				<button className="border px-3 py-2 rounded w-full">Login</button>
			</form>
		</div>
	);
}
