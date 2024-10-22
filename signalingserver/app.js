const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const WhiteBoard = require("./models/Whiteboard");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});

// const emailToSocketIdMap = new Map();
// const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log(`Socket Connected`, socket.id);
    socket.on("room:join", (data) => {
        const { email, slug: room } = data;
        console.log("room:join", email, room, socket.id);
        socket.join(room);
        io.to(room).emit("user:joined", { email, id: socket.id });
        io.to(room).emit("room:join", data);
    });

    socket.on("user:call", ({ to, offer }) => {
        console.log("user:call", to, offer);
        io.to(to).emit("incomming:call", { from: socket.id, offer });
    });

    socket.on("call:accepted", ({ to, ans }) => {
        console.log("call:accepted", ans);
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
    socket.on("whiteboardUpdate", (data) => {
        console.log("whiteboardUpdate", data);
        socket.broadcast.emit("whiteboardUpdate", data);
    });

    socket.on("saveWhiteboard", async (boardData) => {
        const newWhiteboard = new WhiteBoard({
            slug: socket.id,
            appointmentId: socket.id,
            data: boardData,
        });
        await newWhiteboard.save();
        console.log("Whiteboard saved");
    });

    socket.on("chat:joined", (data) => {
        const { room } = data;
        console.log("chat:joined", room);
        socket.join(room);
        io.to(room).emit("chat:joined", data);
    });

    socket.on("chat:message", (data) => {
        const { room, message } = data;
        console.log("chat:message", room);
        io.to(room).emit("chat:message", message);
    });

    
    socket.on("disconnect", () => {
        console.log("Socket Disconnected", socket.id);
    });
});

server.listen(8000, () => {
    console.log("listening on *:8000");
});
