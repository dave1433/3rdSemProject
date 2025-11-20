import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import DashboardPage from "./pages/DashboardPage";
import PlayerBoardPage from "./pages/PlayerBoardPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/player-board" element={<PlayerBoardPage />} />  {/* ✅ new page */}
        </Routes>
    </BrowserRouter>
);
