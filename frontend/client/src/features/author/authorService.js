import api from "../../lib/axios";

const getMyBooks = async () => {
  const response = await api.get("/books");
  return response.data;
};

const getMyRoyaltySummary = async () => {
  const response = await api.get("/books/royaltySummary");
  return response.data;
};


const getMyTickets = async (page = 1, limit = 10) => {
  const response = await api.get(
    `/tickets?page=${page}&limit=${limit}`
  );

  return response.data;
};


const getAuthorDashboard = async () => {
  const response = await api.get("/author/dashboard");
  return response.data;
};

const getTicketById = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}`);
  return response.data;
};

const createTicket = async (ticketData) => {
  const response = await api.post("/tickets", ticketData);
  return response.data;
};

const authorService = {
  getMyBooks,
  getMyRoyaltySummary,
  getMyTickets,
  getAuthorDashboard,
  getTicketById,
  createTicket
};

export default authorService;