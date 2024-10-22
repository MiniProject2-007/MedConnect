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
            for(let i = 0; i < state.chat.length; i++) {
                if(state.chat[i].id === action.payload.id) {
                    return;
                }
            }
            
            state.chat = [action.payload, ...state.chat];
        },
    },
});

export const { setChat, addMessage } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;