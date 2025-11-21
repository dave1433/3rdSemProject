import { useState } from 'react'

import '../App.css'
import {Login} from "./pages/Login.tsx";
import {AdminDashboard} from "./pages/AdminDashboard.tsx";

function App() {
    return (
        <div className="min-h-screen w-full bg-lightBG flex flex-col">
            <AdminDashboard />
        </div>
    );
}

export default App
