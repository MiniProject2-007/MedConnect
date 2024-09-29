const express = require("express");
const http = require("http");
const { Server } = require("socket.io");


const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors:true
});

app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});

const meetingMap = new Map();
const meetingUserMap = new Map();

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("createMeeting", (meetingId) => {
        socket.join(meetingId);
        socket.emit("meetingCreated", meetingId);
        meetingMap.set(meetingId, socket);
        meetingUserMap.set(meetingId, []);
    });
    socket.on("joinMeeting", (data) => {
        const { meetingId, email } = data;
        socket.join(meetingId);
        meetingUserMap.get(meetingId).push(email);
        socket.to(meetingId).emit("userJoined", email);
        meetingMap.get(meetingId).emit("newUserJoined", email, meetingUserMap.get(meetingId));
    });
    
});

server.listen(8000, () => {
    console.log("listening on *:8000");
});
