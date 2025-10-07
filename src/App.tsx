import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ChatPage from "./pages/chat/ChatPage"; // ✅ your chatbot page

import "./App.css";

// ✅ Simple landing page with a button to open the chatbot
const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f9fafb",
        fontFamily: "Kanit, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", color: "#333", marginBottom: "1rem" }}>
        💬 Welcome to Prowolo Chatbot
      </h1>
      <p style={{ marginBottom: "2rem", color: "#555" }}>
        Ask me anything about your work, tools, or setup.
      </p>
      <button
        onClick={() => navigate("/chat")}
        style={{
          padding: "12px 24px",
          backgroundColor: "#2c3d92",
          color: "#fff",
          fontSize: "1.1rem",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          transition: "background 0.2s ease-in-out",
        }}
        onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#3e51b5")}
        onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#2c3d92")}
      >
        🚀 Enter Chatbot
      </button>
    </div>
  );
};

// ✅ Main App
const App: React.FC = () => {
  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
};

export default App;
