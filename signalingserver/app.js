const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    transports: ['websocket', 'polling']
});

const roomToUsers = new Map();
const socketToRoom = new Map();

app.get("/", (req, res) => {
    res.send("<h1>Video Consultation Server</h1>");
});

io.use((socket, next) => {
    console.log(`[${new Date().toISOString()}] Socket connected: ${socket.id}`);
    next();
});

io.on("connection", (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    socket.on("room:join", (data) => {
        try {
            const { email = "Anonymous", slug: room } = data;
            console.log(`User ${email} (${socket.id}) joining room: ${room}`);
            socket.join(room);
            if (!roomToUsers.has(room)) {
                roomToUsers.set(room, new Map());
            }
            roomToUsers.get(room).set(socket.id, { email });
            socketToRoom.set(socket.id, room);
            const usersInRoom = Array.from(roomToUsers.get(room).entries())
                .filter(([id]) => id !== socket.id)
                .map(([id, user]) => ({ id, email: user.email }));
            socket.emit("room:join", { ...data, users: usersInRoom });
            socket.to(room).emit("user:joined", { email, id: socket.id });
            console.log(`Room ${room} now has ${roomToUsers.get(room).size} users`);
        } catch (error) {
            console.error("Error in room:join:", error);
            socket.emit("error", { message: "Failed to join room" });
        }
    });

    socket.on("user:call", ({ to, offer }) => {
        try {
            console.log(`Call from ${socket.id} to ${to}`);
            io.to(to).emit("incomming:call", { from: socket.id, offer });
        } catch (error) {
            console.error("Error in user:call:", error);
            socket.emit("error", { message: "Failed to initiate call" });
        }
    });

    socket.on("call:accepted", ({ to, ans }) => {
        try {
            console.log(`Call accepted: ${socket.id} -> ${to}`);
            io.to(to).emit("call:accepted", { from: socket.id, ans });
        } catch (error) {
            console.error("Error in call:accepted:", error);
            socket.emit("error", { message: "Failed to accept call" });
        }
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
        try {
            io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
        } catch (error) {
            console.error("Error in peer:nego:needed:", error);
            socket.emit("error", { message: "Negotiation failed" });
        }
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        try {
            io.to(to).emit("peer:nego:final", { from: socket.id, ans });
        } catch (error) {
            console.error("Error in peer:nego:done:", error);
            socket.emit("error", { message: "Negotiation completion failed" });
        }
    });

    socket.on("call:end", ({ to }) => {
        try {
            console.log(`Call ended: ${socket.id} -> ${to}`);
            io.to(to).emit("call:end", { from: socket.id });
        } catch (error) {
            console.error("Error in call:end:", error);
        }
    });

    socket.on("user:audio", ({ to, isMuted }) => {
        try {
            io.to(to).emit("user:audio", { from: socket.id, isMuted });
        } catch (error) {
            console.error("Error in user:audio:", error);
        }
    });

    socket.on("user:video", ({ to, isVideoOn }) => {
        try {
            io.to(to).emit("user:video", { from: socket.id, isVideoOn });
        } catch (error) {
            console.error("Error in user:video:", error);
        }
    });

    socket.on("chat:message", (data) => {
        try {
            const { room, message } = data;
            console.log(`Chat message in room ${room}: ${message.id}`);
            io.to(room).emit("chat:message", message);
        } catch (error) {
            console.error("Error in chat:message:", error);
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    socket.on("file:upload", (data) => {
        try {
            const { room, file } = data;
            console.log(`File uploaded in room ${room}: ${file.name || 'unnamed file'}`);
            io.to(room).emit("file:upload", file);
        } catch (error) {
            console.error("Error in file:upload:", error);
            socket.emit("error", { message: "Failed to share file" });
        }
    });

    socket.on("disconnect", () => {
        try {
            console.log(`Socket Disconnected: ${socket.id}`);
            const room = socketToRoom.get(socket.id);
            if (room) {
                if (roomToUsers.has(room)) {
                    const roomUsers = roomToUsers.get(room);
                    roomUsers.delete(socket.id);
                    if (roomUsers.size === 0) {
                        roomToUsers.delete(room);
                        console.log(`Room ${room} is now empty and has been removed`);
                    } else {
                        console.log(`Room ${room} now has ${roomUsers.size} users`);
                        io.to(room).emit("user:left", { id: socket.id });
                    }
                }
                socketToRoom.delete(socket.id);
            }
        } catch (error) {
            console.error("Error handling disconnect:", error);
        }
    });

    socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});

server.on("error", (error) => {
    console.error("Server error:", error);
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});
