import Home from "./pages/Home";
import Login from "./pages/Login";
import Post from "./pages/Post";

const routes=[
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/posts/:id",
        element: <Post />
    }
];



export default routes;