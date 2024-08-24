import { configureStore } from "@reduxjs/toolkit";
import { themeReducer } from "./features/themeSlice";

export const makeStore = () => {
    // console.log(themeReducer)
    return configureStore({
        reducer: {
            theme: themeReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    });
};
