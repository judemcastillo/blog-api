import {
	BrowserRouter,
	Routes,
	Route,
	Link,
	useParams,
	useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import { api, setToken } from "./lib/api";

function Home() {
	const [posts, setPosts] = useState([]);
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const data = await api("/posts");
				setPosts(data);
			} catch (err) {
				console.log(err);
			}
		};
		fetchPosts();
	}, []);
	return (
		<div className="max-w-3xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Posts</h1>
			<ul className="space-y-3">
				{posts.map((p) => (
					<li key={p.id} className="border p-3 rounded">
						<Link
							to={`/posts/${p.id}`}
							className="font-semibold hover:underline"
						>
							{p.title}
						</Link>
						<div className="text-sm text-gray-500">
							{new Date(p.createdAt).toLocaleString()}
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

function Post() {
	const { id } = useParams();
	const [post, setPost] = React.useState(null);
	const [comments, setComments] = React.useState([]);
	const [form, setForm] = React.useState({
		content: "",
		authorName: "",
		authorEmail: "",
	});

	useEffect(() => {
		api(`/posts/${id}`).then(setPost).catch(console.error);
		api(`/posts/${id}/comments`).then(setComments).catch(console.error);
	}, [id]);

	async function submit(e) {
		e.preventDefault();
		const c = await api(`/posts/${id}/comments`, {
			method: "POST",
			body: JSON.stringify(form),
		});
		setComments((prev) => [...prev, c]);
		setForm({ content: "", authorName: "", authorEmail: "" });
	}

	if (!post) return <div className="p-4">Loading…</div>;
	return (
		<div className="max-w-3xl mx-auto p-4 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">{post.title}</h1>
				<p className="whitespace-pre-line mt-3">{post.content}</p>
			</div>

			<section>
				<h2 className="text-xl font-semibold mb-2">Comments</h2>
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
							onChange={(e) => setForm({ ...form, authorName: e.target.value })}
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
	);
}

function Login() {
	const nav = useNavigate();
	const [form, setForm] = React.useState({ email: "", password: "" });
	async function submit(e) {
		e.preventDefault();
		const { token } = await api("/auth/login", {
			method: "POST",
			body: JSON.stringify(form),
		});
		setToken(token);
		nav("/admin");
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

function Admin() {
	const [posts, setPosts] = React.useState([]);
	React.useEffect(() => {
		api("/posts?all=1").then(setPosts).catch(console.error);
	}, []);
	return (
		<div className="max-w-3xl mx-auto p-4">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">Admin</h1>
				<Link to="/admin/new" className="border px-3 py-2 rounded">
					New Post
				</Link>
			</div>
			<ul className="space-y-3">
				{posts.map((p) => (
					<li
						key={p.id}
						className="border p-3 rounded flex items-center justify-between"
					>
						<div>
							<div className="font-semibold">{p.title}</div>
							<div className="text-sm text-gray-500">
								{p.published ? "Published" : "Draft"}
							</div>
						</div>
						<Link to={`/admin/edit/${p.id}`} className="underline text-sm">
							Edit
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

function Layout() {
	return (
		<BrowserRouter>
			<nav className="border-b p-3 flex gap-4">
				<Link to="/" className="font-semibold">
					Blog
				</Link>
				<Link to="/admin" className="text-sm">
					Admin
				</Link>
				<Link to="/login" className="text-sm ml-auto">
					Login
				</Link>
			</nav>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/posts/:id" element={<Post />} />
				<Route path="/login" element={<Login />} />
				<Route path="/admin" element={<Admin />} />
			</Routes>
		</BrowserRouter>
	);
}

export default function App() {
	return <Layout />;
}
