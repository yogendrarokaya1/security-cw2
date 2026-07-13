import api from "./axios";
import { Guide } from "@/types";

export const guidesApi = {
  getAll: async (params?: Record<string, string>) => {
    const res = await api.get("/guides", { params });
    return res.data.data as {
      guides: Guide[];
      total: number;
      pages: number;
    };
  },

  getById: async (id: string) => {
    const res = await api.get(`/guides/${id}`);
    return res.data.data as Guide;
  },

  delete: async (id: string) => {
  const res = await api.delete(`/guides/${id}`);
  return res.data;
},



  getMyProfile: async () => {
    const res = await api.get("/guides/profile/me");
    return res.data.data as Guide;
  },

  createProfile: async (data: unknown) => {
    const res = await api.post("/guides/profile", data);
    return res.data.data as Guide;
  },

  updateProfile: async (data: unknown) => {
    const res = await api.put("/guides/profile", data);
    return res.data.data as Guide;
  },

  toggleAvailability: async () => {
    const res = await api.patch(
      "/guides/profile/availability"
    );
    return res.data.data as Guide;
  },

  addReview: async (data: {
    guideId: string;
    bookingId: string;
    rating: number;
    comment: string;
  }) => {
    const res = await api.post("/guides/review", data);
    return res.data.data as Guide;
  },
};