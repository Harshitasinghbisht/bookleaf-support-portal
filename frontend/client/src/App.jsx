import './App.css'
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "./features/auth/authSlice";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AuthorDashboard from "./pages/AuthorDashboard";
import MyBooksPage from "./pages/MyBooksPage";
import MyTicketPage from "./pages/MyTicketPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import AdminTicketsPage from "./pages/AdminTicketsPage";
import Navbar from "./components/layout/Navbar";
import TicketDetailsPage from './pages/TicketDetailsPage';
import { Link } from "react-router-dom";
function NotFoundPage() {
  return <h1>404 - Page Not Found</h1>;
}
function AccessDeniedPage() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <Link to="/author/dashboard">Go to Dashboard</Link>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();

useEffect(() => {
  dispatch(fetchCurrentUser());
}, [dispatch]);
  return (
    <div className="min-h-screen">
     <Navbar />

      <hr />
       
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Author-only routes */}
        
        <Route element={<ProtectedRoute allowedRoles={["AUTHOR"]} />}>
          <Route
            path="/author/dashboard"
            element={<AuthorDashboard />}
          />
          <Route path="/author/tickets/:ticketId" element={<TicketDetailsPage />}/>
          <Route path="/author/books" element={<MyBooksPage />} />
          <Route path="/author/tickets" element={<MyTicketPage />} />
          <Route
            path="/author/tickets/new"
            element={<CreateTicketPage />}
          />
        </Route>
<Route
  path="/author/tickets/:ticketId"
  element={<TicketDetailsPage />}
/>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route
            path="/admin/tickets"
            element={<AdminTicketsPage />}
          />
        </Route>

        {/* Public fallback */}
        <Route path="/access-denied" element={<AccessDeniedPage />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
