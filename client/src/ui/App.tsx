import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router";
import PlayerRootLayout from "./components/PlayerRootLayout";

import { PlayerBoardPage } from "./pages/player/PlayerBoardPage";
import { PlayerHistoryPage } from "./pages/player/PlayerHistoryPage";
import { PlayerResultsPage } from "./pages/player/PlayerResultsPage";
import { PlayerMyTransactionPage } from "./pages/player/PlayerMyTransactionPage";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";

const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/login" replace /> },
    { path: "/login", element: <Login /> },

    { path: "/admin", element: <AdminDashboard /> },

    {
        path: "/player",
        element: <PlayerRootLayout />,   //  REAL layout
        children: [
            { index: true, element: <Navigate to="board" replace /> },
            { path: "board", element: <PlayerBoardPage /> },
            { path: "history", element: <PlayerHistoryPage /> },
            { path: "transactions", element: <PlayerMyTransactionPage /> },
            { path: "results", element: <PlayerResultsPage /> },
        ],
    },

    { path: "*", element: <Navigate to="/login" replace /> },
]);

export default function App() {
    return <RouterProvider router={router} />;
}
