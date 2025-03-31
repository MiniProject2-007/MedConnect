import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db.js";

import appointmentRouter from "./routes/appointment.js";
import recordRouter from "./routes/record.js";
import whiteboardRouter from "./routes/whiteboard.js";
import doctorRouter from "./routes/doctor.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/api/appointment", appointmentRouter);
app.use("/api/record", recordRouter);
app.use("/api/whiteboard", whiteboardRouter);
app.use("/api/doctor", doctorRouter);

const startServer = async () => {
    try {
        await connectDB();
        app.listen(5000, () => {
            console.log("Server is running on port 5000");
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();
