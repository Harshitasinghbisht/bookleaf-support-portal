import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import authorReducer from "../features/author/authorSlice"
import adminReducer from "../features/admin/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    author:authorReducer,
    admin:adminReducer,
  },
});
