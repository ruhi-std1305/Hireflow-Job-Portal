import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Jobs from "./pages/Jobs";
import EmployerDashboard from "./pages/EmployerDashboard";
import Admin from "./pages/Admin";
import HomePage from "./HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
       
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/jobs" element={
          <ProtectedRoute><Jobs /></ProtectedRoute>
        } />
        <Route path="/employer-dashboard" element={
          <ProtectedRoute><EmployerDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute><Admin /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;