import api from "./axios";

export const plannerApi = {
  generate: async (data: {
    budget: { min: number; max: number };
    duration: number;
    groupSize: number;
    interests: string[];
    fitnessLevel: string;
    startDate: string;
    region?: string;
  }) => {
    const res = await api.post("/planner/generate", data);
    return res.data.data;
  },
};