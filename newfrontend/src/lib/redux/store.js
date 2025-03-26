import { configureStore } from "@reduxjs/toolkit";
import { chatReducer } from "./features/chatSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            chat: chatReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    });
};
