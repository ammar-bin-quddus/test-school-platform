import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { RootState } from "../app/store";
import { updateTokens, logout } from "../features/auth/authSlice";

// Use Vite env (define VITE_API_URL in your .env)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create a single axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Axios-based baseQuery for RTK Query
const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" }
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    { status?: number; data?: unknown }
  > =>
  async (args, api) => {
    const { url, method = "GET", data, params, headers } = args;

    try {
      // Attach access token from state
      const state = api.getState() as RootState;
      const token = state.auth.accessToken;
      const authHeaders = token
        ? { Authorization: `Bearer ${token}` }
        : undefined;

      const result = await axiosInstance.request({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: { ...headers, ...authHeaders },
      });

      return { data: result.data };
    } catch (err) {
      const error = err as AxiosError;

      // If 401, try refresh flow once
      if (error.response?.status === 401) {
        try {
          const state = api.getState() as RootState;
          const refreshToken = state.auth.refreshToken;
          if (!refreshToken) throw new Error("No refresh token");

          // Call refresh endpoint
          const refreshRes = await axiosInstance.post(
            baseUrl + "/auth/refresh",
            { refreshToken }
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            refreshRes.data as { accessToken: string; refreshToken?: string };

          // Update tokens in store
          api.dispatch(
            updateTokens({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken ?? refreshToken,
            })
          );

          // Retry original request with new token
          const retryHeaders = {
            ...args.headers,
            Authorization: `Bearer ${newAccessToken}`,
          };

          const retryResult = await axiosInstance.request({
            url: baseUrl + url,
            method,
            data,
            params,
            headers: retryHeaders,
          });

          return { data: retryResult.data };
        } catch (refreshErr) {
          // Refresh failed → log out
          console.error("Refresh failed:", refreshErr);
          api.dispatch(logout());
        }
      }

      return {
        error: {
          status: error.response?.status,
          data: error.response?.data ?? error.message,
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Auth", "Users", "Tests", "Certificates"],
  endpoints: () => ({}),
});
