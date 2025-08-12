import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TicketWithDetails } from '@shared/schema';

interface TicketState {
  tickets: TicketWithDetails[];
  loading: boolean;
  error: string | null;
  selectedTicket: TicketWithDetails | null;
  filters: {
    status: string[];
    priority: string[];
    assignee: string[];
  };
  searchQuery: string;
}

const initialState: TicketState = {
  tickets: [],
  loading: false,
  error: null,
  selectedTicket: null,
  filters: {
    status: [],
    priority: [],
    assignee: [],
  },
  searchQuery: '',
};

const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<TicketWithDetails[]>) => {
      state.tickets = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedTicket: (state, action: PayloadAction<TicketWithDetails | null>) => {
      state.selectedTicket = action.payload;
    },
    updateTicket: (state, action: PayloadAction<TicketWithDetails>) => {
      const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
    },
    addTicket: (state, action: PayloadAction<TicketWithDetails>) => {
      state.tickets.unshift(action.payload);
    },
    removeTicket: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<Partial<TicketState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  setTickets,
  setLoading,
  setError,
  setSelectedTicket,
  updateTicket,
  addTicket,
  removeTicket,
  setFilters,
  setSearchQuery,
} = ticketSlice.actions;

export default ticketSlice.reducer;
