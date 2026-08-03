import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login              from "./pages/Login";
import Home               from "./pages/Home";
import Jobs               from "./pages/FindJobsPage";
import JobDetail          from "./pages/JobDetailsPage";
import Companies          from "./pages/CompaniesPage";
import CompanyDetail      from "./pages/CompanyDetailsPage";
import Admin              from "./pages/Admin";
import EmployerDashboard  from "./pages/EmployerDashboard";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import ApplicationsPage   from "./pages/ApplicationsPage";
import ProfilePage        from "./pages/ProfilePage";
import ProtectedRoute     from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/"              element={<Home />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/jobs"          element={<Jobs />} />
        <Route path="/jobs/:id"      element={<JobDetail />} />
        <Route path="/companies"     element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><JobSeekerDashboard /></ProtectedRoute>
        } />
        <Route path="/applications" element={
          <ProtectedRoute><ApplicationsPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/employer-dashboard" element={
          <ProtectedRoute><EmployerDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute><Admin /></ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;