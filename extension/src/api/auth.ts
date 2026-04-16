import apiClient from "./client";
import { LoginResponse, User } from "@/types";

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const res = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return res.data;
};

export const getMe = async (): Promise<User> => {
  const res = await apiClient.get<{ status: string; data: User }>("/user/me");
  return res.data.data;
};
