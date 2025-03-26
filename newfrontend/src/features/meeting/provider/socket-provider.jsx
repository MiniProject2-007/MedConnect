import React, { createContext, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = (props) => {
    const socket = useMemo(
        () =>
            io(import.meta.env.VITE_SIGNALING_SERVER_URL, {
                transports: ["websocket"],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            }),
        []
    );


    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );
};
