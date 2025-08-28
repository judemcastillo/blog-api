import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { api } from "../lib/api.js";
import Header from "../sections/Header.jsx";
import { isAuthed, getRole } from "../lib/auth.js";

export default function NewPost() {
	const nav = useNavigate();
	const [form, setForm] = useState({ title: "", content: "" });
	const [err, setErr] = useState("");
	const [loading, setLoading] = useState(false);

	const role = getRole();
	const authed = isAuthed();

	// Block access if not logged in or not AUTHOR/ADMIN
	if (!authed || (role !== "AUTHOR" && role !== "ADMIN")) {
		return (
			<>
				<Header />
				<div className="max-w-md mx-auto p-6">
					<h1 className="text-xl font-bold">Access Denied</h1>
					<p className="text-gray-600">
						You do not have permission to create posts.
					</p>
				</div>
			</>
		);
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setErr("");
		setLoading(true);

		try {
			const res = await api("/posts", {
				method: "POST",
				body: JSON.stringify({
					title: form.title,
					content: form.content,
					published: true,
				}),
			});

			// redirect to new post detail page
			nav(`/posts/${res.id}`);
		} catch (e) {
			setErr(e.message || "Failed to create post");
		} finally {
			setLoading(false);
		}
	}

	const input = "border p-2 rounded w-full";

	return (
		<div>
			<Header />
			<div className="min-w-screen bg-gray-100 min-h-screen">
				<div className="max-w-md mx-auto p-4 space-y-3 ">
					<h1 className="text-2xl font-bold">Create New Post</h1>
					<form onSubmit={handleSubmit} className="space-y-3">
						<div>
							<label className="block mb-1">Title</label>
							<input
								className={input}
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								placeholder="Enter post title"
								required
							/>
						</div>
						<div>
							<label className="block mb-1">Content</label>
							<textarea
								className={input}
								rows="6"
								value={form.content}
								onChange={(e) => setForm({ ...form, content: e.target.value })}
								placeholder="Write your content here..."
								required
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50"
						>
							{loading ? "Posting..." : "Create Post"}
						</button>
						{err && <div className="text-red-600 text-sm">{err}</div>}
					</form>
				</div>
			</div>
		</div>
	);
}
