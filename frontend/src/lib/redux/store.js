import { configureStore } from "@reduxjs/toolkit";
import { themeReducer } from "./features/themeSlice";
import { chatReducer } from "./features/chatSlice";

export const makeStore = () => {
    // console.log(themeReducer)
    return configureStore({
        reducer: {
            theme: themeReducer,
            chat: chatReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    });
};
