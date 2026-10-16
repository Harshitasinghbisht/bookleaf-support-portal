import { useState } from "react";
import { Eye, EyeOff, BookOpen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, clearAuthError } from "../features/auth/authSlice";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

const dispatch = useDispatch();
const navigate = useNavigate();
const location = useLocation();

const { status, error: authError } = useSelector(
  (state) => state.auth
);

const isLoading = status === "loading";

  
async function handleSubmit(event) {
  event.preventDefault();
  setError("");

  dispatch(clearAuthError());

  if (!email.trim() || !password) {
    setError("Please enter both email and password.");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    setError("Please enter a valid email address.");
    return;
  }

  try {
    const user = await dispatch(
      loginUser({
        email: email.trim(),
        password,
      })
    ).unwrap();

    const role = user?.role?.toUpperCase();

    const destination =
      role === "ADMIN"
        ? "/admin/tickets"
        : role === "AUTHOR"
          ? "/author/dashboard"
          : null;

    if (!destination) {
      setError("Your account does not have an authorized portal role.");
      return;
    }

    const requestedPath = location.state?.from?.pathname;

    // Only restore a requested path that belongs to this user's role.
    const safeRequestedPath =
      role === "ADMIN" && requestedPath?.startsWith("/admin/")
        ? requestedPath
        : role === "AUTHOR" && requestedPath?.startsWith("/author/")
          ? requestedPath
          : null;

    navigate(safeRequestedPath || destination, { replace: true });
  } catch (err) {
    setError(
      typeof err === "string"
        ? err
        : "Login failed. Please check your credentials and try again."
    );
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F0E5] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-[#E5D8C5] bg-[#FFFCF6] p-8 shadow-lg shadow-[#34271F]/5 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B4035] text-[#FFFCF6] shadow-sm">
            <BookOpen size={24} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#34271F]">
            BookLeaf
          </h1>

          <p className="mt-2 text-sm text-[#796A59]">
            Author Support Portal
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#34271F]">
            Welcome back
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#796A59]">
            Sign in to manage your books and support tickets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#514437]"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-[#D8C8B2] bg-white px-4 py-3 text-sm text-[#34271F] outline-none transition placeholder:text-[#A39482] focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#514437]"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-[#D8C8B2] bg-white px-4 py-3 pr-12 text-sm text-[#34271F] outline-none transition placeholder:text-[#A39482] focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC]"
              />

              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-[#796A59] transition hover:text-[#355843]"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {(error || authError) && (
            <p
              role="alert"
              className="rounded-lg border border-[#E8C9BE] bg-[#FAEDE8] px-3 py-2 text-sm text-[#873F30]"
            >
              {error || authError}
            </p>
          )}

          <button
  type="submit"
  disabled={isLoading}
  className="w-full rounded-lg bg-[#355843] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#294633] focus:outline-none focus:ring-2 focus:ring-[#66866B] focus:ring-offset-2 focus:ring-offset-[#FFFCF6] disabled:cursor-not-allowed disabled:opacity-60"
>
  {isLoading ? "Signing in..." : "Sign in"}
</button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E5D8C5]" />
          <span className="text-xs text-[#A39482]">BOOKLEAF</span>
          <div className="h-px flex-1 bg-[#E5D8C5]" />
        </div>

        <p className="text-center text-xs leading-5 text-[#796A59]">
          Secure access for BookLeaf authors and administrators.
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
