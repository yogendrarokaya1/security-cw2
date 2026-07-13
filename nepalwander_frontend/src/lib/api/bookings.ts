import api from "./axios";
import { Booking } from "@/types";

export const bookingsApi = {
  // ── Admin ─────────────────────────────────────────────
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get("/admin/bookings", { params });
    return res.data.data as { bookings: Booking[]; total: number };
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api.patch(`/admin/bookings/${id}/status`, { status });
    return res.data.data as Booking;
  },

  // ── User ──────────────────────────────────────────────
  create: async (data: {
    packageId: string;
    startDate: string;
    paymentMethod: string;
    specialRequests?: string;
    travelers: unknown[];
  }) => {
    const res = await api.post("/bookings", data);
    return res.data.data;
  },

  getMyBookings: async () => {
    const res = await api.get("/bookings/my-bookings");
    return res.data.data as Booking[];
  },

  getById: async (id: string) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data.data as Booking;
  },

  getByBookingNumber: async (number: string) => {
    const res = await api.get(`/bookings/number/${number}`);
    return res.data.data as Booking;
  },

  cancel: async (id: string, reason: string) => {
    const res = await api.patch(`/bookings/${id}/cancel`, { reason });
    return res.data.data as Booking;
  },

  confirmPayment: async (
    id: string,
    data: { transactionId: string; paymentMethod: string }
  ) => {
    const res = await api.patch(`/bookings/${id}/confirm-payment`, data);
    return res.data.data as Booking;
  },
};