import { useContext } from "react";
import { SocketContext } from "../provider/socket-provider";

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};
