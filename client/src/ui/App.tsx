import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
    Outlet
} from "react-router";
import { PlayerBoardPage } from "./pages/player/PlayerBoardPage";
import { PlayerHistoryPage } from "./pages/player/PlayerHistoryPage";
import { PlayerResultsPage } from "./pages/player/PlayerResultsPage";
import { PlayerMyBalancePage } from "./pages/player/PlayerMyBalancePage";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";

function PlayerRootLayout() {
    return <Outlet />;
}

const router = createBrowserRouter([
    // Redirect root → login
    { path: "/", element: <Navigate to="/login" replace /> },

    // Login page
    { path: "/login", element: <Login /> },

    // ADMIN
    { path: "/admin", element: <AdminDashboard /> },

    // PLAYER
    {
        path: "/player",
        element: <PlayerRootLayout />,
        children: [
            { index: true, element: <Navigate to="board" replace /> },
            { path: "board", element: <PlayerBoardPage /> },
            { path: "history", element: <PlayerHistoryPage /> },
            { path: "balance", element: <PlayerMyBalancePage /> },
            { path: "results", element: <PlayerResultsPage /> },
        ],
    },

    // fallback
    { path: "*", element: <Navigate to="/login" replace /> },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
