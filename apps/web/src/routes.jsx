import Home from "./pages/Home";
import Login from "./pages/Login";
import Post from "./pages/Post";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";
import NewPost from "./pages/NewPost";
import EditPost from "./pages/EditPost";

const routes = [
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/posts/:id",
		element: <Post />,
	},
	{
		path: "/admin",
		element: (
			<ProtectedRoute>
				<Admin />
			</ProtectedRoute>
		),
	},
	{
		path: "/register",
		element: <Register />,
	},
	{
		path: "/posts/new",
		element: (
			<ProtectedRoute>
				<NewPost />
			</ProtectedRoute>
		),
	},

	{
		path: "/posts/:id/edit",
		element: (
			<ProtectedRoute>
				<EditPost />
			</ProtectedRoute>
		),
	},
];

export default routes;
