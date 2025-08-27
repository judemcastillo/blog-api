import { Link } from "react-router-dom";

export default function Header() {
	return (
		<header className="bg-white shadow border-b p-3 flex items-center justify-center">
			<div className="flex gap-4 max-w-4xl justify-between items-center content-between min-w-3xl px-5">
				<div className="max-w-3xl ">
					<h1 className="text-2xl font-bold">My Blog</h1>
				</div>
				<nav className="space-x-4 flex items-center ml-auto max-w-3xl">
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
			</div>
		</header>
	);
}
