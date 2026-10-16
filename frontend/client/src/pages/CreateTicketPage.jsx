import { useState ,useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {  ArrowLeft,  Paperclip,  Send,  BookOpen,  FileText,} from "lucide-react";
import { fetchMyBooks } from "../features/author/authorSlice";
import { createAuthorTicket } from "../features/author/authorSlice";


const categories = [
  { value: "ROYALTY_PAYMENTS", label: "Royalty & Payments" },
  { value: "ISBN_METADATA", label: "ISBN & Metadata Issues" },
  { value: "PRINTING_QUALITY", label: "Printing & Quality" },
  { value: "DISTRIBUTION_AVAILABILITY", label: "Distribution & Availability" },
  { value: "BOOK_STATUS_PRODUCTION", label: "Book Status & Production Updates" },
  { value: "GENERAL_INQUIRY", label: "General Inquiry" },
];

function CreateTicketPage() {
 const dispatch = useDispatch();
const navigate = useNavigate();
const [attachment, setAttachment] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [errors,setErrors]=useState({});
const [message, setMessage] = useState("");
const [form, setForm] = useState({
  bookId: "",
  category: "GENERAL_INQUIRY",
  subject: "",
  description: "",
});
 
 const {
  books = [],
  booksStatus,
} = useSelector((state) => state.author);

useEffect(() => {
  dispatch(fetchMyBooks());
}, [dispatch]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setMessage("");
  }

  
async function handleSubmit(event) {
  event.preventDefault();

  const nextErrors = {};

  if (!form.subject.trim()) {
    nextErrors.subject = "Please enter a subject.";
  } else if (form.subject.trim().length < 5) {
    nextErrors.subject = "Subject must contain at least 5 characters.";
  }

  if (!form.description.trim()) {
    nextErrors.description = "Please describe your issue.";
  } else if (form.description.trim().length < 20) {
    nextErrors.description =
      "Please provide at least 20 characters so our team can understand the issue.";
  }

  if (attachment && attachment.size > 5 * 1024 * 1024) {
    nextErrors.attachment = "The attachment must be 5 MB or smaller.";
  }

  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) {
    return;
  }

  setIsSubmitting(true);
  setMessage("");

  try {
    const result = await dispatch(
      createAuthorTicket({
        subject: form.subject.trim(),
        description: form.description.trim(),
        bookId: form.bookId || undefined,
        category: form.category,
      })
    ).unwrap();

    setMessage("Ticket created successfully!");

    // The API returns the new ticket under result.ticket.
    navigate(`/author/tickets/${result.ticket.id}`);
  } catch (error) {
    setMessage(
      typeof error === "string"
        ? error
        : "Unable to create your ticket. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
}


  return (
    <main className="min-h-screen bg-[#F6F0E5] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/author/tickets"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#355843] transition hover:text-[#294633]"
        >
          <ArrowLeft size={17} />
          Back to my tickets
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-[#6B4035]">
            AUTHOR SUPPORT
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#34271F] sm:text-3xl">
            Create a support ticket
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#796A59]">
            Tell us what you need help with. Include enough detail to help our
            team investigate your issue.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-[#E5D8C5] bg-[#FFFCF6] p-5 shadow-sm shadow-[#34271F]/5 sm:p-8"
        >
          <div className="mb-7 flex items-start gap-3 rounded-xl bg-[#F5EBDD] p-4">
            <div className="rounded-lg bg-[#6B4035] p-2 text-white">
              <FileText size={19} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#34271F]">
                Before you submit
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#796A59]">
                Select the relevant category and explain the issue clearly.
                You can track the response from your support tickets page.
              </p>
            </div>
          </div>

          <div className="space-y-6">
           
<div>
  <label
    htmlFor="bookId"
    className="mb-2 block text-sm font-semibold text-[#514437]"
  >
    Related book
    <span className="ml-2 font-normal text-[#796A59]">
      (Optional)
    </span>
  </label>

  <div className="relative">
    <BookOpen
      size={18}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#796A59]"
    />

    <select
      id="bookId"
      name="bookId"
      value={form.bookId}
      onChange={handleChange}
      disabled={booksStatus === "loading"}
      className="w-full appearance-none rounded-lg border border-[#D8C8B2] bg-white py-3 pl-10 pr-10 text-sm text-[#34271F] outline-none transition focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC] disabled:cursor-wait disabled:bg-[#F5EBDD]"
    >
      <option value="">
        {booksStatus === "loading"
          ? "Loading your books..."
          : "General / Account-level issue"}
      </option>

      {books.map((book) => (
        <option key={book.id} value={book.id}>
          {book.title}
        </option>
      ))}
    </select>

    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#796A59]">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  </div>

  <p className="mt-2 text-xs leading-5 text-[#796A59]">
    Link this ticket to a specific book, or leave it unselected
    for account, login, and general questions.
  </p>
</div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-[#514437]"
              >
                Issue category <span className="text-[#8B472F]">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#D8C8B2] bg-white px-4 py-3 text-sm text-[#34271F] outline-none focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC]"
              >
               {categories.map((category) => (
                   <option key={category.value} value={category.value}>
                     {category.label}
                   </option>
                 ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-medium text-[#514437]"
              >
                Subject <span className="text-[#8B472F]">*</span>
              </label>
              <input
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                maxLength={150}
                placeholder="Briefly describe the issue"
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? "subject-error" : undefined}
                className="w-full rounded-lg border border-[#D8C8B2] bg-white px-4 py-3 text-sm text-[#34271F] outline-none placeholder:text-[#A39482] focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC]"
              />
              <div className="mt-2 flex justify-between gap-3">
                {errors.subject ? (
                  <p id="subject-error" role="alert" className="text-xs text-[#8B472F]">
                    {errors.subject}
                  </p>
                ) : (
                  <span className="text-xs text-[#796A59]">
                    Keep it short and specific.
                  </span>
                )}
                <span className="shrink-0 text-xs text-[#796A59]">
                  {form.subject.length}/150
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-[#514437]"
              >
                Describe your issue <span className="text-[#8B472F]">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                maxLength={3000}
                placeholder="Explain what happened, when it happened, and what help you need..."
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "description-error" : undefined
                }
                className="w-full resize-y rounded-lg border border-[#D8C8B2] bg-white px-4 py-3 text-sm leading-6 text-[#34271F] outline-none placeholder:text-[#A39482] focus:border-[#66866B] focus:ring-2 focus:ring-[#E0E9DC]"
              />
              <div className="mt-2 flex justify-between gap-3">
                {errors.description ? (
                  <p
                    id="description-error"
                    role="alert"
                    className="text-xs text-[#8B472F]"
                  >
                    {errors.description}
                  </p>
                ) : (
                  <span className="text-xs text-[#796A59]">
                    Minimum 20 characters.
                  </span>
                )}
                <span className="shrink-0 text-xs text-[#796A59]">
                  {form.description.length}/3000
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="attachment"
                className="mb-2 block text-sm font-medium text-[#514437]"
              >
                Attachment{" "}
                <span className="font-normal text-[#796A59]">(optional)</span>
              </label>

              <label
                htmlFor="attachment"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D8C8B2] bg-[#FAF5EC] px-4 py-6 text-center transition hover:bg-[#F5EBDD]"
              >
                <Paperclip size={22} className="mb-2 text-[#6B4035]" />
                <span className="text-sm font-medium text-[#34271F]">
                  Choose a file
                </span>
                <span className="mt-1 text-xs text-[#796A59]">
                  Maximum 5 MB. Server-side file validation will also be required.
                </span>
                <input
                  id="attachment"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="sr-only"
                  onChange={(event) => {
                    setAttachment(event.target.files?.[0] || null);
                    setErrors((previous) => ({
                      ...previous,
                      attachment: "",
                    }));
                    setMessage("");
                  }}
                />
              </label>

              {attachment && (
                <p className="mt-2 break-words text-sm text-[#355843]">
                  Selected: {attachment.name}
                </p>
              )}

              {errors.attachment && (
                <p role="alert" className="mt-2 text-xs text-[#8B472F]">
                  {errors.attachment}
                </p>
              )}
            </div>
          </div>

          {message && (
            <p
              role="status"
              className="mt-6 rounded-lg border border-[#D3E0D0] bg-[#EAF1E7] px-4 py-3 text-sm leading-6 text-[#355843]"
            >
              {message}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#E5D8C5] pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/author/tickets")}
              className="rounded-lg border border-[#D8C8B2] px-5 py-3 text-sm font-semibold text-[#514437] transition hover:bg-[#F5EBDD]"
            >
              Cancel
            </button>
           <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#355843] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#294633] focus:outline-none focus:ring-2 focus:ring-[#66866B] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={16} />
              {isSubmitting ? "Submitting..." : "Submit ticket"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CreateTicketPage;
