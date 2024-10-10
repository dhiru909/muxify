import { configureStore } from "@reduxjs/toolkit";
import authenticateReducer from "../features/authenticate/authenticateSlice"
export const store = configureStore({
reducer: {
  authenticate: authenticateReducer,
},

});
