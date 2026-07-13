import api from "./axios";
import {
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
  AuthResponse,
  User,
} from "@/types";

export const authApi = {
  register: async (data: RegisterInput) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  verifyOtp: async (data: VerifyOtpInput) => {
    const res = await api.post("/auth/verify-otp", data);
    return res.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get("/auth/me");
    return res.data.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post("/auth/forgot-password", {
      email,
    });
    return res.data;
  },

  resetPassword: async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    const res = await api.post(
      "/auth/reset-password",
      data
    );
    return res.data;
  },

  resendOtp: async (email: string) => {
    const res = await api.post("/auth/resend-otp", {
      email,
    });
    return res.data;
  },


updateProfile: async (data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  nationality?: string;
  profileImage?: string;
}) => {
  const res = await api.put("/auth/profile", data);
  return res.data.data as User;
},
};