import {
  BookOpen,
  IndianRupee,
  Headset,
  TrendingUp,
  ArrowRight,
  Clock3,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBooks, fetchAuthorDashboard}from "../features/author/authorSlice";

function StatusBadge({ status }) {
  const styles = {
    Published: "bg-[#E3EDE3] text-[#355843]",
    "In Production": "bg-[#F6EBD4] text-[#805E25]",
    Open: "bg-[#FBE9DF] text-[#8B472F]",
    "In Progress": "bg-[#E7EAF4] text-[#4B5784]",
    Resolved: "bg-[#E3EDE3] text-[#355843]",
    Closed: "bg-[#EFE8DE] text-[#6D6255]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] || "bg-[#EFE8DE] text-[#6D6255]"
      }`}
    >
      {status}
    </span>
  );
}

function SectionHeading({ title, linkText, to }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-[#34271F]">{title}</h2>
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-sm font-medium text-[#355843] transition hover:text-[#294633]"
      >
        {linkText}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function AuthorDashboard() {
  
const dispatch = useDispatch();

const {
  books,
  dashboard,
  dashboardStatus,
  dashboardError,
} = useSelector((state) => state.author);

useEffect(() => {
  dispatch(fetchMyBooks());
  dispatch(fetchAuthorDashboard());
}, [dispatch]);


const stats = [
  {
    label: "Total Books",
    value: dashboard?.stats?.totalBooks ?? "—",
    note: "Books in your account",
    icon: BookOpen,
  },
  {
    label: "Royalty Earned",
    value:
      dashboard?.stats?.totalRoyaltyEarned != null
        ? `₹${Number(
            dashboard.stats.totalRoyaltyEarned
          ).toLocaleString("en-IN")}`
        : "—",
    note: "Total royalty earned",
    icon: IndianRupee,
  },
  {
    label: "Pending Royalty",
    value:
      dashboard?.stats?.royaltyPending != null
        ? `₹${Number(
            dashboard.stats.royaltyPending
          ).toLocaleString("en-IN")}`
        : "—",
    note: "Awaiting payment",
    icon: TrendingUp,
  },
  {
    label: "Open Tickets",
    value: dashboard?.stats?.openTickets ?? 0,
    note: "Need your attention",
    icon: Headset,
  },
];


const recentBooks = books.slice(0, 3);
const recentTickets = (dashboard?.recentTickets ?? []).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#F6F0E5] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-[#6B4035]">
            AUTHOR WORKSPACE
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#34271F] sm:text-3xl">
            Your publishing overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#796A59]">
            Keep track of your books, royalty payments, and support requests
            from one place.
          </p>
        </header>

        <section
          aria-label="Account summary"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-5 shadow-sm shadow-[#34271F]/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#796A59]">{stat.label}</p>
                    <p className="mt-3 text-2xl font-bold text-[#34271F]">
                      {stat.value}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#E8EDE4] p-3 text-[#355843]">
                    <Icon size={21} />
                  </div>
                </div>
                <p className="mt-4 text-xs text-[#796A59]">{stat.note}</p>
              </article>
            );
          })}
        </section>

        <section className="mb-8 rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <div className="rounded-lg bg-[#F2E6D5] p-3 text-[#6B4035]">
              <CircleAlert size={21} />
            </div>
            <div>
              <h2 className="font-semibold text-[#34271F]">
                Need help with a book?
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#796A59]">
                Raise a support ticket and follow its progress without losing
                track of your previous conversations.
              </p>
            </div>
          </div>
          <Link
            to="/author/tickets/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#355843] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#294633] focus:outline-none focus:ring-2 focus:ring-[#66866B] focus:ring-offset-2"
          >
            Create support ticket
            <ArrowRight size={16} />
          </Link>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="min-w-0 rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-5 sm:p-6">
            <SectionHeading
              title="Your books"
              linkText="View all"
              to="/author/books"
            />

            <div className="space-y-4">
              {recentBooks.map((book) => (
                <article
                  key={book.title}
                  className="flex items-start gap-3 border-b border-[#E5D8C5] pb-4 last:border-0 last:pb-0"
                >
                  <div className="shrink-0 rounded-lg bg-[#F2E6D5] p-3 text-[#6B4035]">
                    <BookOpen size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-[#34271F]">
                      {book.title}
                    </h3>
                    <p className="mt-1 break-words text-xs text-[#796A59]">
                      {book.isbn}
                    </p>
                    <div className="mt-3">
                     <StatusBadge
                       status={
                         {
                           PUBLISHED_LIVE: "Published",
                           IN_PRODUCTION: "In Production",
                           SUBMITTED: "Submitted",
                         }[book.status] ?? book.status?.replaceAll("_", " ")}
                     />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="min-w-0 rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-5 sm:p-6">
            <SectionHeading
              title="Recent support tickets"
              linkText="View all"
              to="/author/tickets"
            />
           
           <div className="space-y-4">

{dashboardStatus === "loading" && (
  <p className="text-sm text-[#796A59]">
    Loading your support tickets...
  </p>
)}

{dashboardStatus === "failed" && (
  <p className="text-sm text-red-700">
    {dashboardError || "Could not load support tickets."}
  </p>
)}

{dashboardStatus === "succeeded" && recentTickets.length === 0 && (
  <div className="rounded-lg bg-[#F6F0E5] p-4">
    <p className="text-sm font-medium text-[#34271F]">
      No support tickets yet
    </p>
    <p className="mt-1 text-xs text-[#796A59]">
      Your tickets will appear here when you raise a request.
    </p>
  </div>
)}

{dashboardStatus === "succeeded" &&
  recentTickets.map((ticket) => (
    <article
      key={ticket.id}
      className="flex items-start gap-3 border-b border-[#E5D8C5] pb-4 last:border-0 last:pb-0"
    >
      <div className="shrink-0 rounded-lg bg-[#F2E6D5] p-3 text-[#6B4035]">
        <Clock3 size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[#796A59]">
          {ticket.ticketNumber ?? ticket.id}
        </p>

        <h3 className="mt-1 break-words text-sm font-semibold text-[#34271F]">
          {ticket.subject}
        </h3>

        <div className="mt-3">
          <StatusBadge
            status={{
              OPEN: "Open",
              IN_PROGRESS: "In Progress",
              RESOLVED: "Resolved",
              CLOSED: "Closed",
            }[ticket.status] ?? ticket.status?.replaceAll("_", " ")}
          />
        </div>
      </div>
    </article>
    ))}
           </div>

          </section>
        </div>

        <footer className="mt-8 flex items-center justify-center gap-2 pb-2 text-xs text-[#796A59]">
          <CheckCircle2 size={14} />
          <span>BookLeaf Author Support Portal</span>
        </footer>
      </div>
    </main>
  );
}

export default AuthorDashboard;
