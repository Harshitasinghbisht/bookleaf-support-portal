
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, LogOut, Menu, X } from "lucide-react";
import { logoutUser } from "../../features/auth/authSlice";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const role = user?.role?.toUpperCase();

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  const navLinks =
    role === "ADMIN"
      ? [{ label: "Manage Tickets", to: "/admin/tickets" }]
      : role === "AUTHOR"
        ? [
            { label: "Dashboard", to: "/author/dashboard" },
            { label: "My Books", to: "/author/books" },
            { label: "My Tickets", to: "/author/tickets" },
          ]
        : [];

  return (
    <nav className="border-b border-[#E5D8C5] bg-[#FFFCF6]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link
          to={role === "ADMIN" ? "/admin/tickets" : role === "AUTHOR" ? "/author/dashboard" : "/login"}
          className="flex items-center gap-2 font-bold text-[#34271F]"
        >
          <BookOpen size={22} className="text-[#355843]" />
          <span>BookLeaf</span>
        </Link>

        <button
          type="button"
          className="rounded-lg p-2 text-[#34271F] sm:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div
          className={`${menuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-[65px] z-50 flex-col gap-4 border-b border-[#E5D8C5] bg-[#FFFCF6] p-4 sm:static sm:flex sm:flex-row sm:items-center sm:gap-6 sm:border-0 sm:bg-transparent sm:p-0`}
        >
          {isAuthenticated
            ? navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-[#514437] hover:text-[#355843]"
                >
                  {link.label}
                </Link>
              ))
            : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-semibold text-[#355843]"
                >
                  Login
                </Link>
              )}
                 
            {isAuthenticated && role === "AUTHOR" && (
              <Link
                to="/author/tickets/new"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[#514437] hover:text-[#355843]"
              >
                Create Ticket
              </Link>
            )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#355843] px-4 py-2 text-sm font-semibold text-white hover:bg-[#294633] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={16} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
