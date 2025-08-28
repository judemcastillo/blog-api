import { useNavigate,Link } from "react-router-dom";
import { useState } from "react";
import { api, setToken } from "../lib/api.js";
import Header from "../sections/Header.jsx";
import { isAuthed, logout } from "../lib/auth.js";

export default function Login() {
	const nav = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });
	const [errMessage, setErrMessage] = useState("");
	const [authed, setAuthed] = useState(isAuthed());

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
			setErrMessage("Login failed: " + err.message || "Unknown error");
		}
	}

	function handleLogout() {
		logout();
		setAuthed(false);
		nav("/login");
	}

	return (
		<>
			<Header />
			<div className="min-w-screen bg-gray-100 min-h-screen ">
				<div className="max-w-sm mx-auto p-4 space-y-3">
					{authed ? (
						<div className="space-y-3 rounded border bg-white p-4">
							<p className="text-sm text-gray-700">You’re already logged in.</p>
							<div className="flex gap-2">
								<Link
									to="/"
									className="w-full text-center rounded border px-3 py-2 hover:bg-gray-50"
								>
									Go to Home
								</Link>
								<Link
									to="/admin"
									className="w-full text-center rounded border px-3 py-2 hover:bg-gray-50"
								>
									Create Post
								</Link>
							</div>
							<button
								onClick={handleLogout}
								className="w-full rounded border px-3 py-2 hover:bg-gray-50"
							>
								Log out
							</button>
						</div>
					) : (
						<>
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
									onChange={(e) =>
										setForm({ ...form, password: e.target.value })
									}
								/>
								<button className="border px-3 py-2 rounded w-full cursor-pointer hover:bg-gray-200">
									Login
								</button>
								<div className="text-red-600 ">{errMessage}</div>
							</form>
						</>
					)}
				</div>
			</div>
		</>
	);
}
