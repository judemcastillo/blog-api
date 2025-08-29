import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "../sections/Header.jsx";
import { api } from "../lib/api.js";
import { isAuthed, getRole, getUser } from "../lib/auth.js";

export default function EditPost() {
	const { id } = useParams();
	const nav = useNavigate();

	const authed = isAuthed();
	const role = getRole(); // "USER" | "AUTHOR" | "ADMIN" | null
	const me = getUser(); // { id, email, username, role } | null

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [err, setErr] = useState("");
	const [post, setPost] = useState(null);

	const [showDialog, setShowDialog] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [errDel, setErrDel] = useState(null);

	const canEdit = useMemo(() => {
		if (!authed || !post) return false;
		if (role === "ADMIN") return true;
		return post.authorId === me?.id; // owner
	}, [authed, role, post, me]);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setErr("");

		api(`/posts/${id}`)
			.then((data) => {
				if (!cancelled) setPost(data);
			})
			.catch((e) => {
				if (!cancelled) setErr(e.message || "Failed to load post");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [id]);

	async function saveChanges(nextPublished = null) {
		if (!post) return;
		setSaving(true);
		setErr("");

		try {
			const body = {
				title: post.title,
				content: post.content,
			};
			// Only include "published" if caller wants to change it
			if (nextPublished !== null) body.published = nextPublished;

			const updated = await api(`/posts/${post.id}`, {
				method: "PUT",
				body: JSON.stringify(body),
			});
			setPost(updated);
		} catch (e) {
			setErr(e.message || "Failed to save changes");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		setDeleting(true);
		setErrDel(null);
		try {
			await api(`/posts/${post.id}`, { method: "DELETE" });
			nav("/");
		} catch (err) {
			setErrDel(err.message || "Failed to delete the post.");
		} finally {
			setDeleting(false);
			setShowDialog(false);
		}
	}
	const input = "border p-2 rounded w-full bg-white";

	return (
		<>
			<Header />

			<div className="min-w-screen bg-gray-100 min-h-screen">
				<div className="max-w-4xl mx-auto p-4 space-y-4 w-full">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold">Edit Post</h1>
						<Link
							to={`/posts/${id}`}
							className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
						>
							View Post
						</Link>
					</div>

					{loading && <div className="text-sm text-gray-600">Loading…</div>}
					{err && <div className="text-sm text-red-600">{err}</div>}

					{!loading && post && (
						<>
							{/* Access message if not allowed */}
							{!canEdit && (
								<div className="rounded border bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
									You don’t have permission to edit this post.
								</div>
							)}

							<form
								onSubmit={(e) => {
									e.preventDefault();
									saveChanges(null);
								}}
								className="space-y-3 bg-white p-4 rounded shadow"
							>
								<div>
									<label className="block mb-1">Title</label>
									<input
										className={input}
										value={post.title}
										onChange={(e) =>
											setPost({ ...post, title: e.target.value })
										}
										disabled={!canEdit}
										required
									/>
								</div>

								<div>
									<label className="block mb-1">Content</label>
									<textarea
										className={input}
										rows="10"
										value={post.content}
										onChange={(e) =>
											setPost({ ...post, content: e.target.value })
										}
										disabled={!canEdit}
										required
									/>
								</div>

								<div className="flex flex-wrap gap-2">
									<span className="text-xs rounded border px-2 py-1 bg-gray-50">
										Status: {post.published ? "Published" : "Draft"}
									</span>
									<span className="text-xs rounded border px-2 py-1 bg-gray-50">
										Author ID: {post.authorId}
									</span>
								</div>

								{canEdit && (
									<div className="flex flex-wrap gap-2">
										<button
											type="submit"
											disabled={saving}
											className="rounded bg-gray-800 text-white px-3 py-2 hover:bg-gray-700 disabled:opacity-50"
										>
											{saving ? "Saving…" : "Save Changes"}
										</button>

										{/* Publish / Unpublish */}
										{post.published ? (
											<button
												type="button"
												onClick={() => saveChanges(false)}
												disabled={saving}
												className="rounded border px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
											>
												{saving ? "Working…" : "Unpublish (Save as Draft)"}
											</button>
										) : (
											<button
												type="button"
												onClick={() => saveChanges(true)}
												disabled={saving}
												className="rounded border px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
											>
												{saving ? "Working…" : "Publish"}
											</button>
										)}

										<button
											type="button"
											onClick={() => setShowDialog(true)}
											disabled={saving}
											className="rounded border border-red-400 text-red-600 px-3 py-2 hover:bg-red-50 disabled:opacity-50 ml-auto"
										>
											Delete
										</button>
										{showDialog && (
											<div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
												<div className="bg-white p-6 rounded shadow-xl w-80">
													<h2 className="text-lg font-semibold mb-3">
														Confirm Deletion
													</h2>
													<p className="text-sm text-gray-600 mb-4">
														Are you sure you want to delete this post? This
														action cannot be undone.
													</p>
													<div className="flex justify-end gap-2">
														<button
															onClick={() => setShowDialog(false)}
															className="px-3 py-1 rounded border hover:bg-gray-100"
															disabled={deleting}
														>
															Cancel
														</button>
														<button
															onClick={handleDelete}
															className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
															disabled={deleting}
														>
															{deleting ? "Deleting…" : "Delete"}
														</button>
													</div>
													{errDel && (
														<p className="text-red-500 text-sm mt-2">
															{errDel}
														</p>
													)}
												</div>
											</div>
										)}
									</div>
								)}
							</form>
						</>
					)}
				</div>
			</div>
		</>
	);
}
