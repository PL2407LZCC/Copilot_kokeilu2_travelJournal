import React, { useState, useContext } from "react";
import "./assets/styles/App.css";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

function AppContent() {
  console.log("AppContent rendering...");
  const { user } = useContext(AuthContext);
  console.log("User from context:", user);
  
  return (
    <div className="App">
      <h1>Debug: App is rendering</h1>
      <p>User: {user ? user.username : "Not logged in"}</p>
    </div>
  );
}

function App() {
  console.log("App component rendering...");
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;