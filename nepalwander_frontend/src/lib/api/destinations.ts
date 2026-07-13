import api from "./axios";
import { Destination, PaginatedResponse } from "@/types";

export const destinationsApi = {
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get("/destinations", { params });
    return res.data.data as {
      destinations: Destination[];
      total: number;
      pages: number;
    };
  },

  getFeatured: async () => {
    const res = await api.get("/destinations/featured");
    return res.data.data as Destination[];
  },

  getById: async (id: string) => {
    const res = await api.get(`/destinations/${id}`);
    return res.data.data as Destination;
  },

  getBySlug: async (slug: string) => {
    const res = await api.get(
      `/destinations/slug/${slug}`
    );
    return res.data.data as Destination;
  },

  create: async (data: Partial<Destination>) => {
    const res = await api.post("/destinations", data);
    return res.data.data as Destination;
  },

  update: async (
    id: string,
    data: Partial<Destination>
  ) => {
    const res = await api.put(`/destinations/${id}`, data);
    return res.data.data as Destination;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/destinations/${id}`);
    return res.data;
  },
};