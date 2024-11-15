import cors from "@fastify/cors";
import websocketPlugin from "@fastify/websocket";
import fastify from "fastify";
import { makeOrLoadRoom } from "./src/rooms.js";
import { unfurl } from "./src/unfurl.js";
import connectDB from "./src/db/db.js";

const PORT = 9000;

const app = fastify();
app.register(websocketPlugin);
app.register(cors, { origin: "*" });

app.register(async (app) => {
    app.get("/connect/:roomId", { websocket: true }, async (socket, req) => {
        const roomId = req.params.roomId;
        const sessionId = req.query?.sessionId;

        const room = await makeOrLoadRoom(roomId);
        room.handleSocketConnect({ sessionId, socket });
    });

    app.addContentTypeParser("*", (_, __, done) => done(null));
    app.get("/unfurl", async (req, res) => {
        const url = req.query.url;
        res.send(await unfurl(url));
    });
});

app.listen({ port: PORT,host:'0.0.0.0' }, async (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
	await connectDB();
    console.log(`Server started on port ${PORT}`);
});
