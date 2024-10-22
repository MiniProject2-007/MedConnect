import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chat: [],
    },
    reducers: {
        setChat: (state, action) => {
            state.chat = action.payload;
        },
    },
});

export const { setChat } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
