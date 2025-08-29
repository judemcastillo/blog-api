import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import Header from "../sections/Header.jsx";
import { getRole } from "../lib/auth.js";
import { Link } from "react-router-dom";

export default function Post() {
	const navigate = useNavigate();
	const { id } = useParams();
	const [post, setPost] = useState(null);
	const [comments, setComments] = useState([]);
	const [form, setForm] = useState({
		content: "",
		authorName: "",
		authorEmail: "",
	});

	const [showDialog, setShowDialog] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [errDel, setErrDel] = useState(null);

	useEffect(() => {
		const fetchPost = async () => {
			try {
				const postData = await api(`/posts/${id}`);
				setPost(postData);
			} catch (err) {
				console.log(err);
			}
		};
		const fetchComment = async () => {
			try {
				const commentData = await api(`/posts/${id}/comments`);
				setComments(commentData);
			} catch (err) {
				console.log(err);
			}
		};
		fetchPost();
		fetchComment();
	}, [id]);

	async function submit(e) {
		e.preventDefault();
		const submitComment = await api(`/posts/${id}/comments`, {
			method: "POST",
			body: JSON.stringify(form),
		});
		setComments((prev) => [...prev, submitComment]);
		setForm({ content: "", authorName: "", authorEmail: "" });
	}

	async function handleDelete() {
		setDeleting(true);
		setErrDel(null);
		try {
			await api(`/posts/${post.id}`, { method: "DELETE" });
			navigate("/");
		} catch (err) {
			setErrDel(err.message || "Failed to delete the post.");
		} finally {
			setDeleting(false);
			setShowDialog(false);
		}
	}

	const role = getRole();

	if (!post)
		return (
			<div>
				<Header />
				<div className="p-4 m-auto">Loading…</div>
			</div>
		);
	return (
		<>
			<Header />
			<div className="max-w-4xl mx-auto p-4 space-y-6 w-full">
				<div>
					<h1 className="text-3xl font-bold">{post.title}</h1>
					{(role === "ADMIN" || role === "AUTHOR") && (
						<div className="mt-4">
							<p>By: {post.author.username || post.author.email}</p>
							{!post.published ? (
								<p className="text-sm text-gray-500"> Draft</p>
							) : (
								<p>
									Created: {new Date(post.createdAt).toLocaleString()}
									{post.updatedAt &&
										post.updatedAt !== post.createdAt &&
										` | Updated: ${new Date(post.updatedAt).toLocaleString()}`}
									{post.publishedAt &&
										` | Published: ${new Date(
											post.publishedAt
										).toLocaleString()}`}
								</p>
							)}
						</div>
					)}
					<p className="whitespace-pre-line mt-3 py-10">{post.content}</p>
					{(role === "ADMIN" || role === "AUTHOR") && (
						<div className="mt-4 space-x-2">
							<Link to={`/posts/${post.id}/edit`}>
								<button className="bg-gray-800 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-300 hover:text-gray-800">
									Edit Post
								</button>
							</Link>
							<button
								className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-200 hover:text-gray-800"
								onClick={() => setShowDialog(true)}
							>
								Delete Post
							</button>
							{showDialog && (
								<div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
									<div className="bg-white p-6 rounded shadow-xl w-80">
										<h2 className="text-lg font-semibold mb-3">
											Confirm Deletion
										</h2>
										<p className="text-sm text-gray-600 mb-4">
											Are you sure you want to delete this post? This action
											cannot be undone.
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
											<p className="text-red-500 text-sm mt-2">{errDel}</p>
										)}
									</div>
								</div>
							)}
						</div>
					)}
				</div>
				<hr />
				<section>
					<h2 className="text-xl font-semibold mb-2">
						{comments.length} Comments
					</h2>
					<ul className="space-y-2 mb-4">
						{comments.map((c) => (
							<li key={c.id} className="border p-2 rounded">
								<div className="text-sm text-gray-600">
									{c.authorName || "Anonymous"}
								</div>
								<div>{c.content}</div>
							</li>
						))}
					</ul>

					<form onSubmit={submit} className="space-y-2">
						<textarea
							required
							className="w-full border p-2 rounded"
							rows="3"
							value={form.content}
							onChange={(e) => setForm({ ...form, content: e.target.value })}
							placeholder="Write a comment…"
						/>
						<div className="grid grid-cols-2 gap-2">
							<input
								className="border p-2 rounded"
								placeholder="Name (optional)"
								value={form.authorName}
								onChange={(e) =>
									setForm({ ...form, authorName: e.target.value })
								}
							/>
							<input
								className="border p-2 rounded"
								placeholder="Email (optional)"
								value={form.authorEmail}
								onChange={(e) =>
									setForm({ ...form, authorEmail: e.target.value })
								}
							/>
						</div>
						<button className="border px-3 py-2 rounded">Post comment</button>
					</form>
				</section>
			</div>
		</>
	);
}
