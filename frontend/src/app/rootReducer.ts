// src/app/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import authReducer from "../features/auth/authSlice";
// (You can add more slices here: usersSlice, testsSlice, certificatesSlice)

const rootReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export type RootReducer = ReturnType<typeof rootReducer>;
export default rootReducer;
