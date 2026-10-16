import { socket } from "../socket";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTickets } from "../features/author/authorSlice";
import {
  Search,
  Plus,
  MessageSquareText,
  Clock3,
  CheckCircle2,
  CircleDot,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

function formatStatus(status) {
  const labels = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
  };

  return labels[status] ?? status?.replaceAll("_", " ") ?? "Unknown";
}

function formatCategory(category) {
  const labels = {
    ROYALTY_PAYMENTS: "Royalty & Payments",
    PRINTING_QUALITY: "Printing Quality",
    GENERAL_INQUIRY: "General Inquiry",
  };

  return labels[category] ?? category?.replaceAll("_", " ") ?? "Uncategorized";
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const statusStyles = {
  OPEN: "bg-[#FBE9DF] text-[#8B472F]",
  IN_PROGRESS: "bg-[#F6EBD4] text-[#805E25]",
  RESOLVED: "bg-[#E3EDE3] text-[#355843]",
  CLOSED: "bg-[#EFE8DE] text-[#6D6255]",
};

const priorityStyles = {
  CRITICAL: "text-red-700",
  HIGH: "text-[#8B472F]",
  MEDIUM: "text-[#805E25]",
  LOW: "text-[#796A59]",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
        statusStyles[status] ?? "bg-[#EFE8DE] text-[#6D6255]"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function MyTicketsPage() {
  const dispatch = useDispatch();

const {
  tickets = [],
  ticketsStatus,
  ticketsError,
  ticketsPagination,
  stats,
} = useSelector((state) => state.author);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

useEffect(() => {
  dispatch(fetchMyTickets({ page: currentPage, limit: pageSize }));
}, [dispatch, currentPage]);


  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        String(ticket.ticketNumber ?? "").includes(query) ||
        ticket.subject?.toLowerCase().includes(query) ||
        formatCategory(ticket.category).toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);


useEffect(() => {
  function handleAuthorTicketsUpdated(data) {
    console.log("1. AUTHOR EVENT RECEIVED:", data);

    dispatch(fetchMyTickets({ page: currentPage, limit: pageSize }))
      .unwrap()
      .then((result) => {
        console.log("2. TICKETS FETCHED SUCCESSFULLY:", result);
      })
      .catch((error) => {
        console.error("2. TICKET FETCH FAILED:", error);
      });
  }

  socket.on("author:tickets:updated", handleAuthorTicketsUpdated);

  if (!socket.connected) {
    socket.connect();
  }

  return () => {
    socket.off("author:tickets:updated", handleAuthorTicketsUpdated);
  };
}, [dispatch,currentPage]);

const counts = [
  {
    label: "Total tickets",
    value: stats?.total ?? 0,
    icon: MessageSquareText,
  },
  {
    label: "Open",
    value: stats?.open ?? 0,
    icon: CircleDot,
  },
  {
    label: "In progress",
    value: stats?.inProgress ?? 0,
    icon: Clock3,
  },
  {
    label: "Resolved",
    value: stats?.resolved ?? 0,
    icon: CheckCircle2,
  },
];

  return (
    <main className="min-h-screen bg-[#F6F0E5] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-[#6B4035]">
              AUTHOR WORKSPACE
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-[#34271F] sm:text-3xl">
              My Support Tickets
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#796A59]">
              Track your requests, follow support conversations, and see the
              latest updates from the BookLeaf team.
            </p>
          </div>

          <Link
            to="/author/tickets/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#355843] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#294633] focus:outline-none focus:ring-2 focus:ring-[#66866B] focus:ring-offset-2"
          >
            <Plus size={18} />
            Create ticket
          </Link>
        </header>

        <section
          aria-label="Ticket statistics"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {counts.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                className="rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-5 shadow-sm shadow-[#34271F]/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#796A59]">{item.label}</p>
                    <p className="mt-3 text-2xl font-bold text-[#34271F]">
                      {ticketsStatus === "loading" ? "—" : item.value}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#E8EDE4] p-3 text-[#355843]">
                    <Icon size={21} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-xl border border-[#E5D8C5] bg-[#FFFCF6]">
          <div className="border-b border-[#E5D8C5] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#34271F]">
              Ticket history
            </h2>

            <p className="mt-1 text-sm text-[#796A59]">
              Search your requests or filter them by their current status.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#796A59]"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tickets, subjects, or categories..."
                  aria-label="Search tickets"
                  className="w-full rounded-lg border border-[#D8C8B2] bg-white py-3 pl-10 pr-4 text-sm text-[#34271F] outline-none placeholder:text-[#A39482] focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter tickets by status"
                className="rounded-lg border border-[#D8C8B2] bg-white px-4 py-3 text-sm text-[#34271F] outline-none focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC] sm:w-48"
              >
                <option value="All">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-[#E5D8C5]">
            {ticketsStatus === "loading" && (
              <p className="p-8 text-center text-sm text-[#796A59]">
                Loading your tickets...
              </p>
            )}

            {ticketsStatus === "failed" && (
              <div className="p-8 text-center">
                <p className="text-sm text-red-700">
                  {ticketsError || "Failed to load your tickets."}
                </p>

                <button
                  type="button"
                  onClick={() => dispatch(fetchMyTickets())}
                  className="mt-3 rounded-lg bg-[#355843] px-4 py-2 text-sm font-medium text-white hover:bg-[#294633]"
                >
                  Try again
                </button>
              </div>
            )}

            {ticketsStatus === "succeeded" &&
              filteredTickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="p-5 transition hover:bg-[#FAF5EC] sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-[#6B4035]">
                          Ticket #{ticket.ticketNumber}
                        </span>

                        <StatusBadge status={ticket.status} />
                      </div>

                      <h3 className="text-base font-semibold text-[#34271F]">
                        {ticket.subject}
                      </h3>

                      <p className="mt-2 text-sm text-[#796A59]">
                        {formatCategory(ticket.category)}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#796A59]">
                        <span>Created {formatDate(ticket.createdAt)}</span>

                        <span
                          className={`font-medium ${
                            priorityStyles[ticket.priority] ??
                            "text-[#796A59]"
                          }`}
                        >
                          {ticket.priority
                            ? `${ticket.priority.charAt(0)}${ticket.priority
                                .slice(1)
                                .toLowerCase()} priority`
                            : "Priority not set"}
                        </span>
                      </div>

                      <div className="mt-4 rounded-lg border border-[#E5D8C5] bg-[#FAF5EC] p-3">
                        <p className="mb-1 text-xs font-semibold text-[#514437]">
                          Ticket description
                        </p>

                        <p className="text-sm leading-6 text-[#796A59]">
                          {ticket.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/author/tickets/${ticket.id}`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-[#D8C8B2] px-4 py-2.5 text-sm font-medium text-[#355843] transition hover:bg-[#E8EDE4] focus:outline-none focus:ring-2 focus:ring-[#66866B]"
                    >
                      View conversation
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}

            {ticketsStatus === "succeeded" &&
              filteredTickets.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <MessageSquareText
                    size={28}
                    className="mx-auto mb-3 text-[#A39482]"
                  />

                  <p className="font-medium text-[#34271F]">
                    No tickets found
                  </p>

                  <p className="mt-1 text-sm text-[#796A59]">
                    {tickets.length === 0
                      ? "You haven't created any support tickets yet."
                      : "Try changing your search or status filter."}
                  </p>
                </div>
              )}
          </div>

          
<div className="flex flex-col gap-3 border-t border-[#E5D8C5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
  <p className="text-sm text-[#796A59]">
    Showing {tickets.length ? (currentPage - 1) * pageSize + 1 : 0}
    {"–"}
    {(currentPage - 1) * pageSize + tickets.length} of{" "}
    {ticketsPagination?.totalTickets ?? tickets.length} tickets
  </p>

  <div className="flex items-center gap-3">
    <button
      type="button"
      disabled={
        ticketsStatus === "loading" ||
        !ticketsPagination?.hasPreviousPage
      }
      onClick={() => setCurrentPage((page) => page - 1)}
      className="rounded-lg border border-[#D8C8B2] px-4 py-2 text-sm font-medium text-[#355843] disabled:cursor-not-allowed disabled:opacity-40"
    >
      Previous
    </button>

    <span className="text-sm text-[#796A59]">
      Page {ticketsPagination?.page ?? currentPage} of{" "}
      {ticketsPagination?.totalPages ?? 1}
    </span>

    <button
      type="button"
      disabled={
        ticketsStatus === "loading" ||
        !ticketsPagination?.hasNextPage
      }
      onClick={() => setCurrentPage((page) => page + 1)}
      className="rounded-lg border border-[#D8C8B2] px-4 py-2 text-sm font-medium text-[#355843] disabled:cursor-not-allowed disabled:opacity-40"
    >
      Next
    </button>
  </div>
</div>

        </section>
      </div>
    </main>
  );
}

export default MyTicketsPage;
