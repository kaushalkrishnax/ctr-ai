import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound404 from "./pages/NotFound404";

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-black">
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
