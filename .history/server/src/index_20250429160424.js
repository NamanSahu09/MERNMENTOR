require('dotenv').config(); // FIRST LINE
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const { Server } = require("socket.io");
const socket = require("./socket/socket");
const Chat = require("./models/Chat");
const { rateLimiter } = require("./middlewares/rateLimiter");
require("./config/mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("trust proxy", true);
app.set("view engine", "hbs");

// Uncomment below if you want file logging
/*
app.use(
    morgan("combined", {
        stream: fs.createWriteStream("./logs/access.log", { flags: "a" }),
    })
);
*/

app.use(morgan("dev"));

const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));

// Routes
app.use("/", require("./routes/index"));
app.use("/admin", require("./routes/admin"));
app.use("/mentor", require("./routes/mentor"));
app.use("/student", require("./routes/student"));
app.use("/posts", require("./routes/post"));
app.use("/chats", require("./routes/chat"));
app.use("/messages", require("./routes/message"));
app.use("/notifications", require("./routes/notification"));
app.use("/meetings", require("./routes/meeting"));

// 404 Handler
app.get("*", (req, res) => {
    res.status(404).send("Page Not Found");
});

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000", // ✅ Match frontend
        methods: ["GET", "POST"],
        credentials: true
    },
});


global.msgSocketMap = {};
global.notifySocketMap = {};

socket.start(io);

// crons
require("./crons/interaction.cron");
