import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authorService from "./authorService";

export const fetchMyBooks = createAsyncThunk(
  "author/fetchMyBooks",
  async (_, thunkAPI) => {
    try {
      return await authorService.getMyBooks();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch books"
      );
    }
  }
);

export const fetchMyRoyaltySummary = createAsyncThunk(
  "author/fetchMyRoyaltySummary",
  async (_, thunkAPI) => {
    try {
      return await authorService.getMyRoyaltySummary();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch royalty summary"
      );
    }
  }
);

export const fetchMyTickets = createAsyncThunk(
  "author/fetchMyTickets",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      return await authorService.getMyTickets(page, limit);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to fetch tickets"
      );
    }
  }
);

export const fetchAuthorDashboard = createAsyncThunk(
  "author/fetchAuthorDashboard",
  async (_, thunkAPI) => {
    try {
      return await authorService.getAuthorDashboard();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch dashboard"
      );
    }
  }
);

export const fetchTicketById = createAsyncThunk(
  "author/fetchTicketById",
  async (ticketId, thunkAPI) => {
    try {
      return await authorService.getTicketById(ticketId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch ticket details"
      );
    }
  }
);
export const createAuthorTicket = createAsyncThunk(
  "author/createTicket",
  async (ticketData, thunkAPI) => {
    try {
      return await authorService.createTicket(ticketData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create ticket"
      );
    }
  }
);


const authorSlice = createSlice({
  name: "author",
  initialState: {
    books: [],
    royaltySummary: null,
    booksStatus: "idle",
    royaltyStatus: "idle",
    booksError: null,
    royaltyError: null,
    tickets: [],
    ticketsPagination: null,
    ticketsStatus: "idle",
    ticketsError: null,
    dashboard: null,
    dashboardStatus: "idle",
    dashboardError: null,
    ticketDetails: null,
    ticketDetailsStatus: "idle",
    ticketDetailsError: null,
    createTicketStatus: "idle",
    createTicketError: null,
    stats: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBooks.pending, (state) => {
        state.booksStatus = "loading";
        state.booksError = null;
      })
      .addCase(fetchMyBooks.fulfilled, (state, action) => {
        state.booksStatus = "succeeded";
        state.books = action.payload.books ?? [];
      })
      .addCase(fetchMyBooks.rejected, (state, action) => {
        state.booksStatus = "failed";
        state.booksError = action.payload;
      })
      .addCase(fetchMyRoyaltySummary.pending, (state) => {
        state.royaltyStatus = "loading";
        state.royaltyError = null;
      })
      .addCase(fetchMyRoyaltySummary.fulfilled, (state, action) => {
        state.royaltyStatus = "succeeded";
        state.royaltySummary = action.payload.data;
      })
      .addCase(fetchMyRoyaltySummary.rejected, (state, action) => {
        state.royaltyStatus = "failed";
        state.royaltyError = action.payload;
      })       
       .addCase(fetchMyTickets.pending, (state) => {
         state.ticketsStatus = "loading";
         state.ticketsError = null;
       })
       .addCase(fetchMyTickets.fulfilled, (state, action) => {
         state.ticketsStatus = "succeeded";
         state.tickets = action.payload.data ?? [];
         state.ticketsPagination = action.payload.pagination ?? null;
         state.stats = action.payload.stats ?? null;
       })
       .addCase(fetchMyTickets.rejected, (state, action) => {
         state.ticketsStatus = "failed";
         state.ticketsError =
           action.payload || "Failed to fetch tickets";
       })
      .addCase(fetchAuthorDashboard.pending, (state) => {
        state.dashboardStatus = "loading";
        state.dashboardError = null;
      })
      .addCase(fetchAuthorDashboard.fulfilled, (state, action) => {
        state.dashboardStatus = "succeeded";
        state.dashboard = action.payload.data;
      })
      .addCase(fetchAuthorDashboard.rejected, (state, action) => {
        state.dashboardStatus = "failed";
        state.dashboardError = action.payload || "Failed to fetch dashboard";
      })   
     .addCase(fetchTicketById.pending, (state) => {
       state.ticketDetailsStatus = "loading";
       state.ticketDetailsError = null;
       state.ticketDetails = null;
     })
     .addCase(fetchTicketById.fulfilled, (state, action) => {
       state.ticketDetailsStatus = "succeeded";
       state.ticketDetails = action.payload.ticket;
     })
     .addCase(fetchTicketById.rejected, (state, action) => {
       state.ticketDetailsStatus = "failed";
       state.ticketDetailsError =
         action.payload || "Failed to fetch ticket details";
     })
      .addCase(createAuthorTicket.pending, (state) => {
        state.createTicketStatus = "loading";
        state.createTicketError = null;
      })
      .addCase(createAuthorTicket.fulfilled, (state) => {
        state.createTicketStatus = "succeeded";
      })
      .addCase(createAuthorTicket.rejected, (state, action) => {
        state.createTicketStatus = "failed";
        state.createTicketError =
          action.payload || "Failed to create ticket";
      })
      ;
  },
});

export default authorSlice.reducer;
