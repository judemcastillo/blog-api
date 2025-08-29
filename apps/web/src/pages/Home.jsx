import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import Header from "../sections/Header.jsx";
import { isAuthed, getRole } from "../lib/auth.js";

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
	const authed = isAuthed();
	const role = getRole();
	return (
		<>
			<Header />
			<div className="min-w-screen bg-gray-100 min-h-screen ">
				<div className="max-w-4xl  mx-auto p-4 font-sans space-y-2 w-full ">
					<div className="flex flex-row justify-between items-center">
						<h1 className="text-2xl  font-bold ">Posts</h1>
						{authed && (
							<>
								<Link
									to="/posts/new"
									className="text-sm px-2 py-1 rounded hover:bg-gray-400 bg-gray-700 text-amber-50"
								>
									+ Create Post
								</Link>
							</>
						)}
					</div>
					<ul className="space-y-2 pt-3">
						{posts.map((p) => (
							<li
								key={p.id}
								className="border-none p-3 rounded space-y-2 bg-white shadow-lg hover:scale-103 duration-50"
							>
								<Link
									to={`/posts/${p.id}`}
									className="font-semibold hover:underline"
								>
									{p.title}
								</Link>
								{!p.published && (
									<span className="text-sm text-gray-500"> (Draft)</span>
								)}
								{(role === "ADMIN" || role === "AUTHOR" || role === "USER") && (
									<div className="text-sm text-gray-500">
										<span className="font-semibold">Author: </span>
										{p.author.username || p.author.email}
									</div>
								)}
								<div className="text-sm text-gray-500">
									{new Date(p.createdAt).toLocaleString()}
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</>
	);
}

export default Home;
