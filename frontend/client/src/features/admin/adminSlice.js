import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchAdminTickets,
  fetchAdminTicketById,
  updateAdminTicket,
  sendAdminReply,
  generateAdminTicketDraft,
  fetchAdminDashboardStats,
} from "../admin/adminService.js"

// Fetch ticket list
export const getAdminTickets = createAsyncThunk(
  "admin/getTickets",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchAdminTickets(params);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tickets"
      );
    }
  }
);

// Fetch selected ticket and conversation
export const getAdminTicketDetails = createAsyncThunk(
  "admin/getTicketDetails",
  async (ticketId, { rejectWithValue }) => {
    try {
      return await fetchAdminTicketById(ticketId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch ticket details"
      );
    }
  }
);

// Update ticket status, category, or priority
export const updateTicket = createAsyncThunk(
  "admin/updateTicket",
  async ({ ticketId, updates }, { rejectWithValue }) => {
    try {
      return await updateAdminTicket(ticketId, updates);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update ticket"
      );
    }
  }
);

// Send a public reply
export const replyToAdminTicket = createAsyncThunk(
  "admin/replyToTicket",
  async ({ ticketId, body }, { rejectWithValue }) => {
    try {
      return await sendAdminReply(ticketId, body);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reply"
      );
    }
  }
);

// Generate AI reply draft
export const getAdminTicketDraft = createAsyncThunk(
  "admin/getTicketDraft",
  async (ticketId, { rejectWithValue }) => {
    try {
      return await generateAdminTicketDraft(ticketId);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate AI draft"
      );
    }
  }
);

// Fetch dashboard statistics
export const getAdminDashboardStats = createAsyncThunk(
  "admin/getDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAdminDashboardStats();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard stats"
      );
    }
  }
);

const initialState = {
  tickets: [],
  selectedTicket: null,
  dashboard: null,

  ticketsLoading: false,
  detailsLoading: false,
  updating: false,
  replying: false,
  draftLoading: false,
  dashboardLoading: false,

  error: null,
  detailsError: null,
  actionError: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminErrors: (state) => {
      state.error = null;
      state.detailsError = null;
      state.actionError = null;
    },
    clearSelectedAdminTicket: (state) => {
      state.selectedTicket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Ticket list
      .addCase(getAdminTickets.pending, (state) => {
        state.ticketsLoading = true;
        state.error = null;
      })
      .addCase(getAdminTickets.fulfilled, (state, action) => {
        state.ticketsLoading = false;
        state.tickets = action.payload.data || [];
      })
      .addCase(getAdminTickets.rejected, (state, action) => {
        state.ticketsLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Ticket details
      .addCase(getAdminTicketDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(getAdminTicketDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedTicket = action.payload.data;
      })
      .addCase(getAdminTicketDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload || action.error.message;
      })

      // Update ticket
      .addCase(updateTicket.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.updating = false;

        const updated = action.payload.data;
        const index = state.tickets.findIndex(
          (ticket) => ticket.id === updated.id
        );

        if (index !== -1) {
          state.tickets[index] = {
            ...state.tickets[index],
            ...updated,
          };
        }

        if (state.selectedTicket?.id === updated.id) {
          state.selectedTicket = {
            ...state.selectedTicket,
            ...updated,
          };
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload || action.error.message;
      })

      // Admin reply
      .addCase(replyToAdminTicket.pending, (state) => {
        state.replying = true;
        state.actionError = null;
      })
      .addCase(replyToAdminTicket.fulfilled, (state) => {
        state.replying = false;
      })
      .addCase(replyToAdminTicket.rejected, (state, action) => {
        state.replying = false;
        state.actionError = action.payload || action.error.message;
      })

      // AI draft
      .addCase(getAdminTicketDraft.pending, (state) => {
        state.draftLoading = true;
        state.actionError = null;
      })
      .addCase(getAdminTicketDraft.fulfilled, (state) => {
        state.draftLoading = false;
      })
      .addCase(getAdminTicketDraft.rejected, (state, action) => {
        state.draftLoading = false;
        state.actionError = action.payload || action.error.message;
      })

      // Dashboard statistics
      .addCase(getAdminDashboardStats.pending, (state) => {
        state.dashboardLoading = true;
      })
      .addCase(getAdminDashboardStats.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload.data;
      })
      .addCase(getAdminDashboardStats.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  clearAdminErrors,
  clearSelectedAdminTicket,
} = adminSlice.actions;

export default adminSlice.reducer;
