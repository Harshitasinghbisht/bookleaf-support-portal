import './App.css'
import { useEffect } from "react";
import { useDispatch ,useSelector } from "react-redux";
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
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#F6F0E5] px-6 py-12 text-[#34271F]">
      <div className="w-full max-w-lg text-center">
        {/* Brand */}
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6B4035]">
          BookLeaf
        </p>

        {/* Book illustration */}
        <div className="mx-auto my-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#FFFCF6]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="h-12 w-12 text-[#355843]"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7v14m0-14C9.5 5 6 5 3 6v13c3-1 6.5-1 9 2m0-14c2.5-2 6-2 9-1v13c-3-1-6.5-1-9 2"
            />
          </svg>
        </div>

        {/* Error message */}
        <p className="text-7xl font-bold tracking-tight text-[#355843]">
          404
        </p>

        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">
          Lost in the pages?
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#796A59] sm:text-base">
          We couldn't find the page you're looking for. It may have
          been moved or the link may be incorrect.
        </p>

        {/* Return home */}
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#355843] px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#294633] focus:outline-none focus:ring-2 focus:ring-[#355843] focus:ring-offset-2"
        >
          Return to Home
          <span aria-hidden="true">→</span>
        </Link>

        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-[#796A59]">
          Your next chapter starts here
        </p>
      </div>
    </div>
  );
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

function HomeRedirect() {
  const { user, isAuthenticated, sessionStatus } = useSelector(
    (state) => state.auth
  );

  if (sessionStatus === "idle" || sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F0E5] text-[#34271F]">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role?.toUpperCase() === "ADMIN") {
    return <Navigate to="/admin/tickets" replace />;
  }

  if (user.role?.toUpperCase() === "AUTHOR") {
    return <Navigate to="/author/dashboard" replace />;
  }

  return <Navigate to="/access-denied" replace />;
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
       <Route path="/" element={<HomeRedirect />} />
       <Route path="*" element={<NotFoundPage />} />
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
