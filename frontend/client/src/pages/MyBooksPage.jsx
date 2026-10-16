
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, BookOpen, IndianRupee } from "lucide-react";
import { fetchMyBooks } from "../features/author/authorSlice";

function formatCurrency(value) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
}

function formatStatus(status) {
  return (
    {
      PUBLISHED_LIVE: "Published",
      IN_PRODUCTION: "In Production",
      SUBMITTED: "Submitted",
    }[status] ?? status?.replaceAll("_", " ") ?? "Unknown"
  );
}

export default function MyBooksPage() {
  const dispatch = useDispatch();
  const { books, booksStatus, booksError } = useSelector(
    (state) => state.author
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (booksStatus === "idle") {
      dispatch(fetchMyBooks());
    }
  }, [dispatch, booksStatus]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        book.title?.toLowerCase().includes(query) ||
        book.isbn?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || book.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [books, search, statusFilter]);

  return (
    <main className="min-h-screen bg-[#F6F0E5] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-[#6B4035]">
            AUTHOR WORKSPACE
          </p>
          <h1 className="text-3xl font-bold text-[#34271F]">My Books</h1>
          <p className="mt-2 text-sm text-[#796A59]">
            Track your publications, sales, and royalty payments.
          </p>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-5">
            <div className="flex items-center gap-3">
              <BookOpen className="text-[#355843]" size={22} />
              <p className="text-sm text-[#796A59]">Total books</p>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#34271F]">
              {books.length}
            </p>
          </div>

          <div className="rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-5">
            <div className="flex items-center gap-3">
              <IndianRupee className="text-[#355843]" size={22} />
              <p className="text-sm text-[#796A59]">Total royalty earned</p>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#34271F]">
              {formatCurrency(
                books.reduce(
                  (total, book) =>
                    total + Number(book.totalRoyaltyEarned ?? 0),
                  0
                )
              )}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-[#E5D8C5] bg-[#FFFCF6] p-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#796A59]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by book title or ISBN"
                className="w-full rounded-lg border border-[#E5D8C5] bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#355843] focus:ring-1 focus:ring-[#355843]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-[#E5D8C5] bg-white px-3 py-3 text-sm text-[#34271F] outline-none focus:border-[#355843]"
            >
              <option value="ALL">All statuses</option>
              <option value="PUBLISHED_LIVE">Published</option>
              <option value="IN_PRODUCTION">In Production</option>
              <option value="SUBMITTED">Submitted</option>
            </select>
          </div>

          {booksStatus === "loading" && (
            <p className="py-8 text-center text-sm text-[#796A59]">
              Loading your books...
            </p>
          )}

          {booksStatus === "failed" && (
            <p className="py-8 text-center text-sm text-red-700">
              {booksError || "Could not load your books."}
            </p>
          )}

          {booksStatus === "succeeded" && filteredBooks.length === 0 && (
            <p className="py-8 text-center text-sm text-[#796A59]">
              {books.length === 0
                ? "You don't have any books yet."
                : "No books match your search or selected status."}
            </p>
          )}

          {booksStatus === "succeeded" && filteredBooks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5D8C5] text-[#796A59]">
                    <th className="px-3 py-3 font-medium">Book</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">MRP</th>
                    <th className="px-3 py-3 font-medium">Copies sold</th>
                    <th className="px-3 py-3 font-medium">Royalty earned</th>
                    <th className="px-3 py-3 font-medium">Pending</th>
                    <th className="px-3 py-3 font-medium">Royalty paid</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr
                      key={book.id}
                      className="border-b border-[#E5D8C5] last:border-0"
                    >
                      <td className="px-3 py-4">
                        <p className="font-semibold text-[#34271F]">
                          {book.title}
                        </p>
                        <p className="mt-1 text-xs text-[#796A59]">
                          ISBN: {book.isbn}
                        </p>
                        <p className="mt-1 text-xs text-[#796A59]">
                          {book.genre}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <span className="whitespace-nowrap rounded-full bg-[#E3EDE3] px-3 py-1 text-xs font-medium text-[#355843]">
                          {formatStatus(book.status)}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        {formatCurrency(book.mrp)}
                      </td>
                      <td className="px-3 py-4">
                        {Number(book.totalCopiesSold ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-4">
                         {formatCurrency(book.totalRoyaltyEarned)}
                       </td>
                       
                       {/* Royalty paid */}
                       <td className="px-3 py-4">
                         {formatCurrency(book.royaltyPaid)}
                       </td>
                       
                       {/* Pending royalty */}
                       <td className="px-3 py-4 font-medium text-[#6B4035]">
                         {formatCurrency(book.royaltyPending)}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
