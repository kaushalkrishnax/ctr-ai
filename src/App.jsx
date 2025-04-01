import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import { Home, Create, Login, Signup, Dashboard, NotFound404 } from "./pages";

function App() {
  const { isUserAuthenticated } = useContext(UserContext);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-black">
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          {isUserAuthenticated ? (
            <>
              <Route path="/create" element={<Create />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </>
          )}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
