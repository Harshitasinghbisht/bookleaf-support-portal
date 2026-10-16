import api from "../../lib/axios";

export const fetchAdminTickets = async (params = {}) => {
  const response = await api.get("/admin/tickets", { params });
  return response.data;
};

export const fetchAdminTicketById = async (ticketId) => {
  const response = await api.get(`/admin/tickets/${ticketId}`);
  return response.data;
};

export const updateAdminTicket = async (ticketId, updates) => {
  const response = await api.patch(
    `/admin/tickets/${ticketId}`,
    updates
  );
  return response.data;
};

export const assignAdminTicket = async (ticketId) => {
  const response = await api.patch(
    `/admin/tickets/${ticketId}/assign`
  );
  return response.data;
};

export const sendAdminReply = async (ticketId, body) => {
  const response = await api.post(
    `/admin/tickets/${ticketId}/messages`,
    {
      body,
      type: "RESPONSE",
    }
  );
  return response.data;
};

export const generateAdminTicketDraft = async (ticketId) => {
  const response = await api.post(
    `/admin/tickets/${ticketId}/ai-draft`
  );
  return response.data;
};

export const fetchAdminDashboardStats = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};
