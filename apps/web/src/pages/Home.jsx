import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {api} from "../lib/api.js";
import Header from "../sections/Header.jsx";

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
		<>
		<Header />
			<div className="min-w-screen bg-gray-100 min-h-screen ">
				<div className="max-w-3xl  mx-auto p-4 font-sans ">
					<h1 className="text-2xl  font-bold mb-4">Posts</h1>
					<ul className="space-y-2">
						{posts.map((p) => (
							<li key={p.id} className="border-none p-3 rounded space-y-2 bg-white shadow-lg">
								<Link
									to={`/posts/${p.id}`}
									className="font-semibold hover:underline"
								>
									{p.title}
								</Link>
								<div className="text-sm text-gray-500">
									{new Date(p.createdAt).toLocaleString()}
								</div>
								<div>{p.content}</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</>
	);
}

export default Home;
