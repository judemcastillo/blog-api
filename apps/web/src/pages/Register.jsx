import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { api, setToken } from "../lib/api.js";
import Header from "../sections/Header.jsx";
import { isAuthed } from "../lib/auth.js";

export default function Register() {
	const nav = useNavigate();
	const [form, setForm] = useState({
		email: "",
		username: "",
		password: "",
		role: "USER",
		accessCode: "",
	});
	const [errMessage, setErrMessage] = useState("");
	const authed = isAuthed();

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrMessage("");
		try {
			const res = await api("/auth/register", { method: "POST", body: JSON.stringify(form) });
			setToken(res.token);
			nav("/");
		} catch (err) {
			setErrMessage(err.message || "Unexpected Error");
		}
	};
	const style = "border p-2 rounded w-full bg-white";

	return (
		<>
			<Header />
			<div className="min-w-screen bg-gray-100 min-h-screen ">
				<div className="max-w-sm mx-auto p-4 space-y-3">
					<h1 className="text-2xl font-bold">Register</h1>
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
							<form onSubmit={handleSubmit} className="space-y-3">
								<div>
									<label htmlFor="username">Email</label>
									<input
										type="email"
										name="email"
										value={form.email}
										onChange={handleChange}
										className={style}
										placeholder="Enter your email"
									/>
								</div>
								<div>
									<label htmlFor="username">Username</label>
									<input
										type="text"
										name="username"
										value={form.username}
										onChange={handleChange}
										className={style}
										placeholder="Enter your username (optional)"
									/>
								</div>
								<div>
									<label htmlFor="password">Password</label>
									<input
										type="password"
										name="password"
										value={form.password}
										onChange={handleChange}
										className={style}
										placeholder="Enter your password"
									/>
								</div>
								<div className="flex flex-row items-center gap-2">
									<label htmlFor="role">Role: </label>
									<select
										name="role"
										value={form.role}
										onChange={handleChange}
										className="border p-2 rounded "
									>
										<option value="USER">User</option>
										<option value="AUTHOR">Author</option>
										<option value="ADMIN">Admin</option>
									</select>
								</div>
								<div>
									<label htmlFor="accessCode">
										Access Code (for Admin/Author)
									</label>
									<input
										type="password"
										name="accessCode"
										value={form.accessCode}
										onChange={handleChange}
										className={style}
										placeholder="Enter your access code"
									/>
								</div>
								<button
									type="submit"
									className="w-full rounded border-none px-3 py-2 hover:bg-gray-400 bg-gray-800 text-white cursor-pointer"
								>
									Register
								</button>
							</form>
							<div className="text-red-600 ">{errMessage}</div>
						</>
					)}
				</div>
			</div>
		</>
	);
}
