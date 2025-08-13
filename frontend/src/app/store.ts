// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./rootReducer";
import { baseApi } from "../api/baseApi";
import { setupListeners } from "@reduxjs/toolkit/query";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // persist only auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        // ignore non-serializable actions from redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

// Inferred types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Optional: refetchOnFocus/refetchOnReconnect support for RTK Query
setupListeners(store.dispatch);
