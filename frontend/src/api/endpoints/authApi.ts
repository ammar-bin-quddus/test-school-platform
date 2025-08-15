// src/features/auth/authApi.ts
import { baseApi } from "../../api/baseApi";
import { setCredentials } from "../../features/auth/authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        data: userData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.accessToken && data.refreshToken && data.user) {
            dispatch(
              setCredentials({
                user: data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
              })
            );
          }
        } catch {
          /* ignore */
        }
      },
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.accessToken && data.refreshToken && data.user) {
            dispatch(
              setCredentials({
                user: data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
              })
            );
          }
        } catch {
          /* ignore */
        }
      },
    }),

    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: "/auth/refresh-Token",
        method: "POST",
        data: { refreshToken },
      }),
    }),

    logout: builder.mutation({
      query: (refreshToken) => ({
        url: "/auth/logout",
        method: "POST",
        data: { refreshToken },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch({ type: "auth/logout" });
        } catch {
          /* ignore */
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;
