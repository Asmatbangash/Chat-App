import { Route, Routes } from "react-router-dom"
import { Home, Login, Profile } from "./pages"

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element= {<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  )
}

export default App