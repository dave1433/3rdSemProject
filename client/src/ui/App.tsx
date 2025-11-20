import { useState } from 'react'

import '../App.css'
import {Login} from "./pages/Login.tsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className="min-h-screen bg-lightBG flex flex-col justify-center items-center">
         <span>
             <Login/>
         </span>

     </div>
    </>
  )
}

export default App
