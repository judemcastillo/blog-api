import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

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

export default Home;
