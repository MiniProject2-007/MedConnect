import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chat: [],
    },
    reducers: {
        setChat: (state, action) => {
            state.chat = Array.isArray(action.payload) 
                ? [...action.payload] 
                : [action.payload, ...state.chat];
        },
        addMessage: (state, action) => {
            state.chat = [action.payload, ...state.chat];
        },
    },
});

export const { setChat, addMessage } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;