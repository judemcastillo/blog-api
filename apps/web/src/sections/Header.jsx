import { NavLink, useNavigate } from "react-router-dom";
import { isAuthed, logout, getRole, getUser } from "../lib/auth.js";

export default function Header() {
	function handleLogout() {
		logout();
		nav("/login");
	}

	const nav = useNavigate();
	const authed = isAuthed();
	const role = getRole();
	const user = getUser();

	const link = "text-sm px-2 py-1 rounded hover:bg-gray-100";
	const active = ({ isActive }) =>
		isActive ? `${link} font-semibold underline` : link;
	console.log("payload", getUser());
	return (
		<header className="bg-white  shadow-2xl border-none p-3 flex items-center justify-center">
			<div className="flex gap-4 max-w-4xl justify-between items-center content-between min-w-3xl px-5">
				<div className="max-w-3xl ">
					<h1 className="text-2xl font-bold">My Blog</h1>
				</div>
				<nav className="space-x-4 flex items-center ml-auto max-w-3xl">
					<NavLink to="/" className={active}>
						Home
					</NavLink>

					{role === "ADMIN" && (
						<NavLink to="/admin" className={active}>
							Admin
						</NavLink>
					)}
					{authed ? (
						<>
							<p className="text-sm border-r m-0 pr-1">
								Logged in as: {user.email}
							</p>
							<p className="pl-1 text-sm">{user.role}</p>
							<button
								onClick={handleLogout}
								className="text-sm px-2 py-1 rounded hover:bg-gray-100"
							>
								Logout
							</button>
						</>
					) : (
						<>
							<NavLink to="/login" className={active}>
								Login
							</NavLink>
							<NavLink to="/register" className={active}>
								Register
							</NavLink>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}
