import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { FaBars } from "react-icons/fa";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DasboardPage";
import GuestsPage from "./pages/GuestsPage";
import RoomsPage from "./pages/RoomsPage";
import BookingsPage from "./pages/BookingPage";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
  };

  // Get user data from localStorage for AuthProvider
  const getUserFromStorage = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  return (
    <Router>
      <AuthProvider user={getUserFromStorage()} logout={handleLogout}>
        {token ? (
          <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar with overlay on mobile */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
                onClick={toggleSidebar}
              />
            )}
            <Sidebar
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              onLogout={handleLogout}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
              <Navbar onToggleSidebar={toggleSidebar} />
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <main className="p-4">
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/guests" element={<GuestsPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/rooms" element={<RoomsPage />} />
                    <Route path="/bookings" element={<BookingsPage />} />
                    <Route path="/settings" element={<Settings />} />

                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </main>
              </div>
            </div>
          </div>
        ) : (
          <Routes>
            <Route
              path="/login"
              element={<AuthPage setToken={setToken} isLogin={true} />}
            />
            <Route
              path="/register"
              element={<AuthPage setToken={setToken} isLogin={false} />}
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </AuthProvider>
    </Router>
  );
}

export default App;