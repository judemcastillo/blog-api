import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Header from "../sections/Header";
import { getRole } from "../lib/auth";

export default function AdminDashboard() {
	const role = getRole();
	const [tab, setTab] = useState("users"); // "users" | "posts"
	const [users, setUsers] = useState([]);
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState("");
	const [repair, setRepair] = useState(true);

	useEffect(() => {
		if (role !== "ADMIN") return;
		setLoading(true);
		setErr("");
		Promise.allSettled([api("/admin/users"), api("/admin/posts")]).then(
			([u, p]) => {
				if (u.status === "fulfilled") setUsers(u.value);
				else setErr(u.reason?.message || "Failed to load users");
				if (p.status === "fulfilled") setPosts(p.value);
				else setErr((e) => e || p.reason?.message || "Failed to load posts");
				setLoading(false);
			}
		);
	}, [role]);

	if (role !== "ADMIN") {
		return (
			<>
				<Header />
				<div className="max-w-4xl mx-auto p-6">
					<h1 className="text-xl font-bold">Access denied</h1>
					<p className="text-gray-600">Admins only.</p>
				</div>
			</>
		);
	}

	async function changeUserRole(id, nextRole) {
		try {
			const updated = await api(`/admin/users/${id}`, {
				method: "PATCH",
				body: JSON.stringify({ role: nextRole }), // auto-JSON if you use the improved api.js
			});
			setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
		} catch (e) {
			alert(e.message || "Failed to update role");
		}
	}
	if (repair) {
		return (
			<>
				<Header />
				<div className=" flex flex-col m-auto p-6 space-y-4 bg-gray-100 w-screen h-screen items-center justify-center">
					<div>
						<h2 className="text-xl font-bold m-auto">Repair Mode</h2>
						<p className="text-gray-600">
							You are currently in repair mode. Some features may be limited.
						</p>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Header />
			<div className="max-w-6xl mx-auto p-6 space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold">Admin Dashboard</h1>
					<div className="inline-flex rounded border">
						<button
							onClick={() => setTab("users")}
							className={`px-3 py-1 ${
								tab === "users" ? "bg-gray-800 text-white" : ""
							}`}
						>
							Users
						</button>
						<button
							onClick={() => setTab("posts")}
							className={`px-3 py-1 ${
								tab === "posts" ? "bg-gray-800 text-white" : ""
							}`}
						>
							Posts
						</button>
					</div>
				</div>

				{loading && <div className="text-sm text-gray-600">Loading…</div>}
				{err && <div className="text-sm text-red-600">{err}</div>}

				{/* USERS TAB */}
				{tab === "users" && !loading && (
					<div className="overflow-x-auto rounded border bg-white">
						<table className="w-full text-sm">
							<thead className="bg-gray-50">
								<tr>
									<th className="text-left p-2">ID</th>
									<th className="text-left p-2">Username</th>
									<th className="text-left p-2">Email</th>
									<th className="text-left p-2">Role</th>
									<th className="text-left p-2">Posts</th>
									<th className="text-left p-2">Comments</th>
									<th className="text-left p-2">Actions</th>
								</tr>
							</thead>
							<tbody>
								{(users || []).map((u) => (
									<tr key={u.id} className="border-t">
										<td className="p-2">{u.id}</td>
										<td className="p-2">{u.username || "—"}</td>
										<td className="p-2">{u.email}</td>
										<td className="p-2">
											<span className="rounded border px-2 py-0.5 text-xs">
												{u.role}
											</span>
										</td>
										<td className="p-2">{u._count.posts}</td>
										<td className="p-2">{u._count.comments}</td>
										<td className="p-2">
											<select
												defaultValue={u.role}
												onChange={(e) => changeUserRole(u.id, e.target.value)}
												className="border rounded px-2 py-1"
											>
												<option value="USER">USER</option>
												<option value="AUTHOR">AUTHOR</option>
												<option value="ADMIN">ADMIN</option>
											</select>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{/* POSTS TAB */}
				{tab === "posts" && !loading && (
					<div className="overflow-x-auto rounded border bg-white">
						<table className="w-full text-sm">
							<thead className="bg-gray-50">
								<tr>
									<th className="text-left p-2">ID</th>
									<th className="text-left p-2">Title</th>
									<th className="text-left p-2">Author</th>
									<th className="text-left p-2">Status</th>
									<th className="text-left p-2">Created</th>
									<th className="text-left p-2">Published</th>
								</tr>
							</thead>
							<tbody>
								{(posts || []).map((p) => (
									<tr key={p.id} className="border-t">
										<td className="p-2">{p.id}</td>
										<td className="p-2">{p.title}</td>
										<td className="p-2">
											{p.author?.username || p.author?.email || "—"} (
											{p.author?.role})
										</td>
										<td className="p-2">
											{p.published ? (
												<span className="rounded border px-2 py-0.5 text-xs bg-green-50">
													Published
												</span>
											) : (
												<span className="rounded border px-2 py-0.5 text-xs bg-yellow-50">
													Draft
												</span>
											)}
										</td>
										<td className="p-2">
											{new Date(p.createdAt).toLocaleString()}
										</td>
										<td className="p-2">
											{p.publishedAt
												? new Date(p.publishedAt).toLocaleString()
												: "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</>
	);
}
