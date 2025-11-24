import { useEffect } from "react";
import {createBrowserRouter, Navigate, RouterProvider, Outlet,} from "react-router";
import { PlayerBoardPage } from "./pages/player/PlayerBoardPage";
import { PlayerHistoryPage } from "./pages/player/PlayerHistoryPage.tsx";
import { PlayerResultsPage } from "./pages/player/PlayerResultsPage";
import { PlayerMyBalancePage } from "./pages/player/PlayerMyBalancePage";

function PlayerRootLayout() {
    return <Outlet />;
}

const router = createBrowserRouter([
    {
        path: "/player",
        element: <PlayerRootLayout />,
        children: [
            { index: true, element: <Navigate to="board" replace /> },
            {
                path: "board",
                element: <PlayerBoardPage />,
            },
            {
                path: "history",
                element: <PlayerHistoryPage />,
            },
            {
                path: "balance",
                element: <PlayerMyBalancePage />,
            },
            {
                path: "results",
                element: <PlayerResultsPage />,
            },
        ],
    },
    // fallback: redirect anything else to /player/board
    {
        path: "*",
        element: <Navigate to="/player/board" replace />,
    },
]);

function App() {
    useEffect(() => {
        // TODO: initialize player data (optional)
    }, []);

    return <RouterProvider router={router} />;
}

export default App;
