import { Route, Routes } from "react-router-dom"
import { Home, Login, Profile, SignUp } from "./pages"

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element= {<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />

      </Routes>
    </div>
  )
}

export default App