const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

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
 

    socket.on("chat:joined", (data) => {
        const { room } = data;
        socket.join(room);
        io.to(room).emit("chat:joined", data);
    });

    socket.on("chat:message", (data) => {
        const { room, message } = data;
        console.log("chat:message", message);
        io.to(room).emit("chat:message", message);
    });

    socket.on("file:upload", (data) => {
        const { room, file } = data;
        io.to(room).emit("file:upload", file);
    });

    socket.on("disconnect", () => {
        console.log("Socket Disconnected", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket Disconnected", socket.id);
    });
});

server.listen(8000, async () => {
    console.log("listening on *:8000");
});
