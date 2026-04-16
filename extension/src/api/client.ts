import axios from "axios";
import { STORAGE_KEYS } from "@/types";
import { getItem } from "@/utils/storage";

export const API_BASE = "http://localhost:3000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach token from storage on every request
apiClient.interceptors.request.use(async (config) => {
  const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear auth data so popup redirects to login
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await chrome.storage.local.remove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.AUTH_USER,
        STORAGE_KEYS.AUTH_LOGIN_TIME,
      ]);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
