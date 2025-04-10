import { TLSocketRoom } from "@tldraw/sync-core";
import WhiteBoard from "./models/Whiteboard.js";

const rooms = new Map();

async function readSnapshotIfExists(roomId) {
    try {
        const whiteboard = await WhiteBoard.findOne({ slug: roomId });
        if (!whiteboard) return undefined;
        return JSON.parse(whiteboard.data);
    } catch (e) {
        console.error(`Error reading snapshot for room ${roomId}:`, e);
        return undefined;
    }
}

async function saveSnapshot(roomId, snapshot) {
    try {
        const data = JSON.stringify(snapshot);
        await WhiteBoard.updateOne(
            { slug: roomId },
            { slug: roomId, data },
            { upsert: true }
        );
    } catch (e) {
        console.error(`Error saving snapshot for room ${roomId}:`, e);
    }
}

let mutex = Promise.resolve(null);

export async function makeOrLoadRoom(roomId) {
    mutex = mutex
        .then(async () => {
            if (rooms.has(roomId)) {
                const roomState = rooms.get(roomId);
                if (!roomState.room.isClosed()) {
                    return roomState.room; // Return existing room
                }
            }

            console.log("Loading room", roomId);
            const initialSnapshot = await readSnapshotIfExists(roomId);

            const room = new TLSocketRoom({
                initialSnapshot,
                onSessionRemoved(room, args) {
                    setTimeout(() => {
                        console.log("Client disconnected", args.sessionId, roomId);
                        if (args.numSessionsRemaining === 0) {
                            console.log("Closing room", roomId);
                            room.close();
                            rooms.delete(roomId);
                        }
                    }, 2000);
                },
                onDataChange() {
                    console.log("Data changed for room", roomId);
                    saveSnapshot(roomId, room.getCurrentSnapshot());
                },
            });

            rooms.set(roomId, { room });
            return room;
        })
        .catch((error) => {
            console.error(`Error creating/loading room ${roomId}:`, error);
            return null;
        });

    const room = await mutex;
    if (!room) throw new Error(`Failed to load or create room ${roomId}`);
    return room;
}

setInterval(async () => {
    for (const [roomId, roomState] of rooms) {
        const { room } = roomState;
        if (room.isClosed()) {
            console.log("Deleting closed room", roomId);
            rooms.delete(roomId);
        } else {
            console.log("Ensuring persistence for room", roomId);
            const snapshot = room.getCurrentSnapshot();
            saveSnapshot(roomId, snapshot);
        }
    }
}, 500);
