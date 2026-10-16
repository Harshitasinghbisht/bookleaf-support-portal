
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  MessageSquareText,
  Paperclip,
  RefreshCw,
} from "lucide-react";
import { fetchTicketById } from "../features/author/authorSlice";

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
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

function TicketDetailsPage() {
  const { ticketId } = useParams();
  const dispatch = useDispatch();

  const {
    ticketDetails: ticket,
    ticketDetailsStatus,
    ticketDetailsError,
  } = useSelector((state) => state.author);

  useEffect(() => {
    if (ticketId) {
      dispatch(fetchTicketById(ticketId));
    }
  }, [dispatch, ticketId]);

  if (ticketDetailsStatus === "loading" || ticketDetailsStatus === "idle") {
    return (
      <main className="min-h-screen bg-[#F6F0E5] px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-8 text-center text-[#796A59]">
          Loading ticket details...
        </div>
      </main>
    );
  }

  if (ticketDetailsStatus === "failed" || !ticket) {
    return (
      <main className="min-h-screen bg-[#F6F0E5] px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-8 text-center">
          <p className="font-semibold text-[#34271F]">
            Unable to load this ticket
          </p>

          <p className="mt-2 text-sm text-red-700">
            {ticketDetailsError || "Ticket not found."}
          </p>

          <button
            type="button"
            onClick={() => dispatch(fetchTicketById(ticketId))}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#355843] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#294633]"
          >
            <RefreshCw size={16} />
            Try again
          </button>

          <div>
            <Link
              to="/author/tickets"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#355843]"
            >
              <ArrowLeft size={16} />
              Back to tickets
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const messages = ticket.messages ?? [];
  console.log("Ticket details:", ticket);
console.log("Ticket messages:", ticket.messages);
  const attachments = ticket.attachments ?? [];

  return (
    <main className="min-h-screen bg-[#F6F0E5] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/author/tickets"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#355843] hover:underline"
        >
          <ArrowLeft size={17} />
          Back to My Tickets
        </Link>

        <section className="overflow-hidden rounded-xl border border-[#E5D8C5] bg-[#FFFCF6]">
          <header className="border-b border-[#E5D8C5] p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B4035]">
                  Ticket #{ticket.ticketNumber}
                </p>

                <h1 className="mt-2 text-2xl font-bold text-[#34271F]">
                  {ticket.subject}
                </h1>

                <p className="mt-2 text-sm text-[#796A59]">
                  Created {formatDate(ticket.createdAt)}
                </p>
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                  statusStyles[ticket.status] ??
                  "bg-[#EFE8DE] text-[#6D6255]"
                }`}
              >
                {formatStatus(ticket.status)}
              </span>
            </div>
          </header>

          <div className="grid gap-6 border-b border-[#E5D8C5] p-5 sm:grid-cols-2 sm:p-7">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#796A59]">
                Category
              </p>
              <p className="mt-2 text-sm font-semibold text-[#34271F]">
                {formatCategory(ticket.category)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#796A59]">
                Priority
              </p>
              <p
                className={`mt-2 text-sm font-semibold ${
                  priorityStyles[ticket.priority] ?? "text-[#796A59]"
                }`}
              >
                {ticket.priority
                  ? `${ticket.priority.charAt(0)}${ticket.priority
                      .slice(1)
                      .toLowerCase()}`
                  : "Not set"}
              </p>
            </div>

            {ticket.book && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[#796A59]">
                  Associated book
                </p>

                <div className="mt-2 flex items-start gap-3">
                  <BookOpen
                    size={20}
                    className="mt-0.5 text-[#355843]"
                  />

                  <div>
                    <p className="text-sm font-semibold text-[#34271F]">
                      {ticket.book.title}
                    </p>

                    {ticket.book.isbn && (
                      <p className="mt-1 text-xs text-[#796A59]">
                        ISBN: {ticket.book.isbn}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#796A59]">
                First response
              </p>
              <p className="mt-2 text-sm text-[#34271F]">
                {formatDate(ticket.firstResponseAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#796A59]">
                Resolved at
              </p>
              <p className="mt-2 text-sm text-[#34271F]">
                {formatDate(ticket.resolvedAt)}
              </p>
            </div>
          </div>

          <section className="border-b border-[#E5D8C5] p-5 sm:p-7">
            <h2 className="text-lg font-semibold text-[#34271F]">
              Original request
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#796A59]">
              {ticket.description || "No description provided."}
            </p>

            {attachments.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#34271F]">
                  <Paperclip size={16} />
                  Attachments
                </h3>

                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 break-all rounded-lg border border-[#E5D8C5] p-3 text-sm text-[#355843] hover:bg-[#FAF5EC]"
                    >
                      <Paperclip size={16} className="shrink-0" />
                      {attachment.fileName || "View attachment"}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-[#E8EDE4] p-2.5 text-[#355843]">
                <MessageSquareText size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#34271F]">
                  Conversation
                </h2>

                <p className="mt-1 text-sm text-[#796A59]">
                  {messages.length}{" "}
                  {messages.length === 1 ? "message" : "messages"}
                </p>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#D8C8B2] p-8 text-center">
                <MessageSquareText
                  size={26}
                  className="mx-auto mb-3 text-[#A39482]"
                />

                <p className="font-medium text-[#34271F]">
                  No messages yet
                </p>

                <p className="mt-1 text-sm text-[#796A59]">
                  Messages from you and the support team will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {messages.map((message) => {
                  const isAuthor = message.sender?.role === "AUTHOR";

                  return (
                    <article
                      key={message.id}
                      className={`flex ${
                        isAuthor ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`w-full max-w-2xl rounded-xl border p-4 sm:p-5 ${
                          isAuthor
                            ? "border-[#C8D8C5] bg-[#E8EDE4]"
                            : "border-[#E5D8C5] bg-[#FAF5EC]"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[#34271F]">
                              {message.sender?.name ||
                                (isAuthor ? "You" : "Support team")}
                            </p>

                            <p className="mt-1 text-xs text-[#796A59]">
                              {isAuthor ? "Author" : "Support team"}
                            </p>
                          </div>

                          <span className="flex items-center gap-1 text-xs text-[#796A59]">
                            <CalendarDays size={13} />
                            {formatDate(message.createdAt)}
                          </span>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-[#514437]">
                          {message.body}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="border-t border-[#E5D8C5] bg-[#FAF5EC] px-5 py-4">
            <p className="flex items-center gap-2 text-xs text-[#796A59]">
              <Clock3 size={14} />
              Last updated {formatDate(ticket.updatedAt)}
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default TicketDetailsPage;
