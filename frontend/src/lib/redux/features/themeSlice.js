import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("theme") || "light";
    }
    return "light";
};

const themeSlice = createSlice({
    name: "theme",
    initialState: {
        theme: getInitialTheme(),
    },
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
    },
});

export const { setTheme } = themeSlice.actions;
export const themeReducer  = themeSlice.reducer;