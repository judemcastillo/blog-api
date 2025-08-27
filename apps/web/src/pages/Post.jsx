import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "../lib/api.js";
import Header from "../sections/Header.jsx";

export default function Post() {
	const { id } = useParams();
	const [post, setPost] = useState(null);
	const [comments, setComments] = useState([]);
	const [form, setForm] = useState({
		content: "",
		authorName: "",
		authorEmail: "",
	});

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

	if (!post) return <div className="p-4">Loading…</div>;
	return (
		<>
			<Header />
			<div className="max-w-3xl mx-auto p-4 space-y-6">
				<div>
					<h1 className="text-3xl font-bold">{post.title}</h1>
					<p className="whitespace-pre-line mt-3 py-10">{post.content}</p>
				</div>
				<hr />
				<section>
					<h2 className="text-xl font-semibold mb-2">{comments.length} Comments</h2>
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
