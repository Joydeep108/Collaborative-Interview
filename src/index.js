import dotenv from "dotenv";
dotenv.config({
    path: "C:/Users/joyde/Collaborative Interview/.env"
});

import http from "http"; // 1. Import Node's built-in http module
import { Server } from "socket.io"; // 2. Import Socket.IO

import app from "./app.js";
import main from "./db/mongo.db.js";

// Import the socket initialization logic (from the previous roadmap step)
import { initializeSocket } from "./socket/index.js"; 

// 3. Explicitly create the HTTP server using your Express app
const httpServer = http.createServer(app);


// 4. Attach Socket.IO to the HTTP server with CORS configurations
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Update this to your frontend's actual URL in production
        methods: ["GET", "POST"]
    }
});

// 5. Initialize your socket logic
initializeSocket(io);

async function initiateServer() {
    try {
        await main();
        httpServer.listen(process.env.PORT || 8081, () => {
            console.log(`Server listen at http://localhost:${process.env.PORT || 8081}`)
        })
    } catch(err) {
        console.log(err);
        console.log(err.message);
        process.exit(1);
    }
}

initiateServer();