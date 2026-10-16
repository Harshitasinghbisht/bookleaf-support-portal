import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, SlidersHorizontal, MessageSquareText, Clock3, AlertTriangle, CheckCircle2, ArrowUpRight, UserRound, CalendarDays, LogOut, Sparkles,} from "lucide-react";

import { logoutUser } from "../features/auth/authSlice";
import { getAdminTickets, getAdminTicketDetails, updateTicket, replyToAdminTicket, getAdminTicketDraft, getAdminDashboardStats,} from "../features/admin/adminSlice";
import { socket } from "../socket";

const categories = [
  { value: "ROYALTY_PAYMENTS", label: "Royalty & Payments" },
  { value: "ISBN_METADATA", label: "ISBN & Metadata Issues" },
  { value: "PRINTING_QUALITY", label: "Printing & Quality" },
  {value: "DISTRIBUTION_AVAILABILITY",label: "Distribution & Availability"},
  {value: "BOOK_STATUS_PRODUCTION",label: "Book Status & Production Updates"},
  { value: "GENERAL_INQUIRY", label: "General Inquiry" },
];

const statuses = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const priorities = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const priorityStyles = {
  CRITICAL: "bg-[#F8DFDC] text-[#922F28]",
  HIGH: "bg-[#FBE9DF] text-[#8B472F]",
  MEDIUM: "bg-[#F6EBD4] text-[#805E25]",
  LOW: "bg-[#E3EDE3] text-[#355843]",
};

const statusStyles = {
  OPEN: "bg-[#FBE9DF] text-[#8B472F]",
  IN_PROGRESS: "bg-[#F6EBD4] text-[#805E25]",
  RESOLVED: "bg-[#E3EDE3] text-[#355843]",
  CLOSED: "bg-[#EFE8DE] text-[#6D6255]",
};

const formatLabel = (value = "") =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

function Badge({ value, styles }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[value] || "bg-[#EFE8DE] text-[#6D6255]"
      }`}
    >
      {formatLabel(value || "") || "Unknown"}
    </span>
  );
}

function AdminTicketsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    tickets = [],
    selectedTicket: ticketDetails,
    dashboard,
    ticketsLoading,
    detailsLoading,
    updating,
    replying,
    draftLoading,
    dashboardLoading,
    error,
    detailsError,
    actionError,
  } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [draft, setDraft] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("OPEN");

  //socket connection
  useEffect(() => {
  socket.connect();

  return () => {
    socket.disconnect();
  };
}, []);

  useEffect(() => {
    dispatch(getAdminTickets({ page: 1, limit: 50 }));
    dispatch(getAdminDashboardStats());
  }, [dispatch]);

  const displayTickets = useMemo(
    () =>
      tickets.map((ticket) => ({
        ...ticket,
        displayId: `BL-${ticket.ticketNumber}`,
        author: ticket.author?.user?.name || "Unknown author",
        email: ticket.author?.user?.email || "",
        categoryLabel:
          categories.find((item) => item.value === ticket.category)?.label ||
          formatLabel(ticket.category),
        createdAtLabel: formatDate(ticket.createdAt),
      })),
    [tickets]
  );

  
  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return displayTickets.filter((ticket) => {
      const matchesSearch = [
        ticket.displayId,
        ticket.subject,
        ticket.author,
        ticket.email,
      ].some((value) => (value || "").toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || ticket.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "All" || ticket.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [
    displayTickets,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
  ]);

  // Keep the selection valid when tickets load or filters change.

const activeTicketId =
  filteredTickets.find((ticket) => ticket.id === selectedTicketId)?.id ||
  filteredTickets[0]?.id ||
  null;


useEffect(() => {
  if (!activeTicketId) return;

  function handleJoined(data) {
    console.log("Joined ticket room:", data.ticketId);
  }

  function handleTicketError(error) {
    console.error("Ticket room error:", error.message);
  }

  function handleConnect() {
    socket.emit("ticket:join", { ticketId: activeTicketId });
  }

  socket.on("ticket:joined", handleJoined);
  socket.on("ticket:error", handleTicketError);
  socket.on("connect", handleConnect);

  if (!socket.connected) {
    socket.connect();
  } else {
    handleConnect();
  }

  return () => {
    socket.emit("ticket:leave", { ticketId: activeTicketId });
    socket.off("connect", handleConnect);
    socket.off("ticket:joined", handleJoined);
    socket.off("ticket:error", handleTicketError);
  };
}, [activeTicketId]);

useEffect(() => {
  function handleTicketsUpdated() {
    dispatch(getAdminTickets({ page: 1, limit: 50 }));
    dispatch(getAdminDashboardStats());
  }

  socket.on("admin:tickets:updated", handleTicketsUpdated);

  return () => {
    socket.off("admin:tickets:updated", handleTicketsUpdated);
  };
}, [dispatch]);

useEffect(() => {
  if (!activeTicketId) return;

  dispatch(getAdminTicketDetails(activeTicketId));
}, [dispatch, activeTicketId]);



  const selectedFromList = filteredTickets.find(
    (ticket) => ticket.id === activeTicketId
  );

const selectedTicket =
  selectedFromList &&
  ticketDetails?.id === activeTicketId
    ? {
        ...selectedFromList,
        ...ticketDetails,
        displayId: `BL-${ticketDetails.ticketNumber}`,
        author:
          ticketDetails.author?.user?.name ||
          selectedFromList.author,
        email:
          ticketDetails.author?.user?.email ||
          selectedFromList.email,
        categoryLabel:
          categories.find(
            (item) => item.value === ticketDetails.category
          )?.label || formatLabel(ticketDetails.category),
        createdAtLabel: formatDate(ticketDetails.createdAt),
      }
    : selectedFromList;
  
    useEffect(() => {
  if (selectedTicket) {
    setSelectedStatus(selectedTicket.status);
  }
}, [activeTicketId]);
useEffect(() => {
  if (!ticketDetails || ticketDetails.id !== activeTicketId) return;

  const latestDraft = ticketDetails.aiDrafts?.[0];
  setDraft(latestDraft?.content ?? "");
}, [ticketDetails, activeTicketId]);

  const stats = dashboard?.stats;

  const statCards = [
    {
      label: "Total tickets",
      value: stats?.totalTickets ?? "—",
      icon: MessageSquareText,
    },
    {
      label: "Open",
      value: stats?.byStatus?.OPEN ?? "—",
      icon: AlertTriangle,
    },
    {
      label: "In progress",
      value: stats?.byStatus?.IN_PROGRESS ?? "—",
      icon: Clock3,
    },
    {
      label: "Resolved",
      value: stats?.byStatus?.RESOLVED ?? "—",
      icon: CheckCircle2,
    },
  ];

  async function handleLogout() {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login", { replace: true });
    } catch (logoutError) {
      console.error("Logout failed:", logoutError);
    }
  }

function handleStatusChange(event) {
  const nextStatus = event.target.value;

  if (!selectedTicket || selectedTicket.status === "CLOSED") {
    return;
  }

  setSelectedStatus(nextStatus);
}

  async function handleGenerateDraft() {
    if (!activeTicketId) return;

    try {
      const result = await dispatch(
        getAdminTicketDraft(activeTicketId)
      ).unwrap();

      setDraft(result.data.content);
    } catch (requestError) {
      console.error("AI draft generation failed:", requestError);
    }
  }
async function handleSendReply() {
  if (!activeTicketId || !draft.trim() || !canReply) return;

  try {
    // First, send the reply.
    await dispatch(
      replyToAdminTicket({
        ticketId: activeTicketId,
        body: draft.trim(),
      })
    ).unwrap();

    // Then, save the selected status if it changed.
    if (selectedStatus !== selectedTicket.status) {
      await dispatch(
        updateTicket({
          ticketId: activeTicketId,
          updates: { status: selectedStatus },
        })
      ).unwrap();
    }

    setDraft("");

    // Refresh only after the operations succeed.
    await Promise.all([
      dispatch(getAdminTicketDetails(activeTicketId)),
      dispatch(getAdminTickets({ page: 1, limit: 50 })),
      dispatch(getAdminDashboardStats()),
    ]);
  } catch (requestError) {
    console.error("Sending reply or updating status failed:", requestError);
  }
}
 
const canReply = Boolean(
  selectedTicket && selectedTicket.status !== "CLOSED"
);


  return (
    <main className="min-h-screen bg-[#F6F0E5] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-[#6B4035]">
              ADMIN WORKSPACE
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#34271F] sm:text-3xl">
              Support ticket management
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#796A59]">
              Review incoming requests, prioritize urgent issues, and prepare
              responses for authors.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D8C8B2] bg-[#FFFCF6] px-4 py-2.5 text-sm font-semibold text-[#6B4035] hover:bg-[#FAF5EC]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <section
          aria-label="Ticket statistics"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-5 shadow-sm shadow-[#34271F]/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#796A59]">{stat.label}</p>
                    <p className="mt-3 text-2xl font-bold text-[#34271F]">
                      {dashboardLoading ? "…" : stat.value}
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

        {error && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {actionError && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </p>
        )}

        <section className="mb-6 rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#6B4035]" />
            <h2 className="font-semibold text-[#34271F]">
              Filter ticket queue
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#796A59]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets or authors..."
                aria-label="Search tickets or authors"
                className="w-full rounded-lg border border-[#D8C8B2] bg-white py-3 pl-10 pr-3 text-sm text-[#34271F] outline-none placeholder:text-[#A39482] focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className="rounded-lg border border-[#D8C8B2] bg-white px-3 py-3 text-sm text-[#34271F] outline-none focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC]"
            >
              <option value="All">All statuses</option>
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              aria-label="Filter by priority"
              className="rounded-lg border border-[#D8C8B2] bg-white px-3 py-3 text-sm text-[#34271F] outline-none focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC]"
            >
              <option value="All">All priorities</option>
              {priorities.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
              className="rounded-lg border border-[#D8C8B2] bg-white px-3 py-3 text-sm text-[#34271F] outline-none focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC]"
            >
              <option value="All">All categories</option>
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
          <section className="min-w-0 overflow-hidden rounded-xl border border-[#E5D8C5] bg-[#FFFCF6]">
            <div className="flex items-center justify-between border-b border-[#E5D8C5] p-5">
              <h2 className="font-semibold text-[#34271F]">Ticket queue</h2>
              <span className="text-xs text-[#796A59]">
                {filteredTickets.length} results
              </span>
            </div>

            <div className="divide-y divide-[#E5D8C5]">
              {ticketsLoading && (
                <p className="px-5 py-12 text-center text-sm text-[#796A59]">
                  Loading tickets...
                </p>
              )}

              {!ticketsLoading &&
                filteredTickets.map((ticket) => {
                  const isSelected = activeTicketId === ticket.id;

                  return (
                    <button
                      type="button"
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`block w-full p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#66866B] ${
                        isSelected ? "bg-[#EAF1E7]" : "hover:bg-[#FAF5EC]"
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-[#6B4035]">
                          {ticket.displayId}
                        </span>
                        <Badge
                          value={ticket.priority}
                          styles={priorityStyles}
                        />
                        <Badge value={ticket.status} styles={statusStyles} />
                      </div>

                      <h3 className="font-semibold leading-6 text-[#34271F]">
                        {ticket.subject}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#796A59]">
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound size={14} />
                          {ticket.author}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {ticket.createdAtLabel}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-[#796A59]">
                        {ticket.categoryLabel}
                      </p>
                    </button>
                  );
                })}

              {!ticketsLoading && filteredTickets.length === 0 && (
                <p className="px-5 py-12 text-center text-sm text-[#796A59]">
                  No tickets match these filters.
                </p>
              )}
            </div>
          </section>

          <section className="min-w-0 rounded-xl border border-[#E5D8C5] bg-[#FFFCF6]">
            {detailsLoading && (
              <p className="p-8 text-center text-sm text-[#796A59]">
                Loading ticket details...
              </p>
            )}

            {!detailsLoading && detailsError && (
              <p role="alert" className="p-5 text-sm text-red-700">
                {detailsError}
              </p>
            )}

            {!detailsLoading && selectedTicket && (
              <>
                <div className="border-b border-[#E5D8C5] p-5 sm:p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[#6B4035]">
                      {selectedTicket.displayId}
                    </span>
                    <Badge
                      value={selectedTicket.priority}
                      styles={priorityStyles}
                    />
                    <Badge
                      value={selectedStatus}
                      styles={statusStyles}
                    />
                  </div>

                  <h2 className="text-lg font-semibold leading-7 text-[#34271F]">
                    {selectedTicket.subject}
                  </h2>
                  <p className="mt-2 text-sm text-[#796A59]">
                    {selectedTicket.categoryLabel}
                  </p>
                </div>

                <div className="space-y-6 p-5 sm:p-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#34271F]">
                      Author details
                    </h3>
                    <p className="text-sm font-medium text-[#514437]">
                      {selectedTicket.author}
                    </p>
                    <p className="mt-1 break-all text-sm text-[#796A59]">
                      {selectedTicket.email}
                    </p>
                    {selectedTicket.author?.authorCode && (
                      <p className="mt-1 text-xs text-[#796A59]">
                        Author code: {selectedTicket.author.authorCode}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-[#796A59]">
                      Submitted {selectedTicket.createdAtLabel}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-[#34271F]">
                      Original query
                    </h3>
                    <p className="rounded-lg border border-[#E5D8C5] bg-[#FAF5EC] p-4 text-sm leading-6 text-[#514437]">
                      {selectedTicket.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#34271F]">
                      Conversation
                    </h3>

                    {selectedTicket.messages?.length ? (
                      <div className="space-y-3">
                        {selectedTicket.messages.map((message) => (
                          <article
                            key={message.id}
                            className="rounded-lg border border-[#E5D8C5] bg-white p-3"
                          >
                            <div className="mb-2 flex flex-wrap justify-between gap-2">
                              <span className="text-xs font-semibold text-[#355843]">
                                {message.sender?.name || "User"} ·{" "}
                                {formatLabel(message.type)}
                              </span>
                              <span className="text-xs text-[#796A59]">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-6 text-[#514437]">
                              {message.body}
                            </p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#796A59]">
                        No messages in this conversation yet.
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <label
                        htmlFor="replyDraft"
                        className="text-sm font-semibold text-[#34271F]"
                      >
                        Reply draft
                      </label>

                      <button
                        type="button"
                        onClick={handleGenerateDraft}
                        disabled={draftLoading || !canReply}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D8C8B2] bg-white px-3 py-2 text-xs font-semibold text-[#355843] hover:bg-[#EAF1E7] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Sparkles size={15} />
                        {draftLoading ? "Generating..." : "Generate AI draft"}
                      </button>
                    </div>

                    <textarea
                      id="replyDraft"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      rows={6}
                      placeholder="Generate a draft or write your reply..."
                      className="w-full resize-y rounded-lg border border-[#D8C8B2] bg-white px-4 py-3 text-sm leading-6 text-[#34271F] outline-none focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC] disabled:bg-[#FAF5EC]"
                      disabled={!canReply}
                    />

                    <p className="mt-2 text-xs leading-5 text-[#796A59]">
                      Review and edit the response before sending it to the
                      author.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="ticketStatus"
                      className="mb-2 block text-sm font-semibold text-[#34271F]"
                    >
                      Update ticket status
                    </label>
                    <select
                      id="ticketStatus"
                      value={selectedStatus}
                      onChange={handleStatusChange}
                      disabled={updating || selectedTicket.status === "CLOSED"}
                      className="w-full rounded-lg border border-[#D8C8B2] bg-white px-3 py-3 text-sm text-[#34271F] outline-none focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC] disabled:opacity-60"
                    >
                      {statuses.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    {updating && (
                      <p className="mt-2 text-xs text-[#796A59]">
                        Saving status...
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={
                      replying ||
                      !draft.trim() ||
                      !canReply
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#355843] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#294633] focus:outline-none focus:ring-2 focus:ring-[#66866B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {replying ? "Sending reply..." : "Send reply"}
                    <ArrowUpRight size={17} />
                  </button>

                  {!canReply && (
                    <p className="text-xs leading-5 text-[#796A59]">
                      This ticket is resolved or closed. Reopen it before
                      sending another reply.
                    </p>
                  )}
                </div>
              </>
            )}

            {!detailsLoading && !selectedTicket && (
              <div className="p-8 text-center">
                <MessageSquareText
                  size={28}
                  className="mx-auto mb-3 text-[#A39482]"
                />
                <h2 className="font-semibold text-[#34271F]">
                  No ticket selected
                </h2>
                <p className="mt-2 text-sm text-[#796A59]">
                  Load tickets or adjust your filters to select a ticket.
                </p>
              </div>
            )}
          </section>
        </div>

        <p className="mt-4 text-xs leading-5 text-[#796A59]">
          Ticket data, conversation history, status changes, replies, and AI
          drafts are loaded through the backend APIs.
        </p>
      </div>
    </main>
  );
}

export default AdminTicketsPage;
