import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { ClerkProvider } from "@clerk/clerk-react";
import { SocketProvider } from "./features/meeting/provider/socket-provider";
import StoreProvider from "./components/providers/store-provider";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error("Add your Clerk Publishable Key to the .env file");
}
createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <StoreProvider>
                <SocketProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </SocketProvider>
            </StoreProvider>
        </ClerkProvider>
    </StrictMode>
);
