import api from "./axios";
import { Package } from "@/types";

export const packagesApi = {
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get("/packages", { params });
    return res.data.data as {
      packages: Package[];
      total: number;
      pages: number;
    };
  },

  getFeatured: async () => {
    const res = await api.get("/packages/featured");
    return res.data.data as Package[];
  },

  getById: async (id: string) => {
    const res = await api.get(`/packages/${id}`);
    return res.data.data as Package;
  },

  getBySlug: async (slug: string) => {
    const res = await api.get(`/packages/slug/${slug}`);
    return res.data.data as Package;
  },

  getByDestination: async (destinationId: string) => {
    const res = await api.get(
      `/packages/destination/${destinationId}`
    );
    return res.data.data as Package[];
  },

  create: async (data: Partial<Package>) => {
    const res = await api.post("/packages", data);
    return res.data.data as Package;
  },

  update: async (id: string, data: Partial<Package>) => {
    const res = await api.put(`/packages/${id}`, data);
    return res.data.data as Package;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/packages/${id}`);
    return res.data;
  },
};