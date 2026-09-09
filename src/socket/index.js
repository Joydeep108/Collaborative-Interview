// export const initializeSocket = (io) => {

//     io.on("connection", (socket) => {
//         console.log("Someone connected.");
//         console.log("SocketId: ", socket.id);

//         socket.on("message", (data) => {
//             console.log(data);
//             // io.emit("new-message", data);
//             // socket.broadcast.emit("new-message", data);
//             console.log(data);
//             console.log(data.message);
//             console.log(data.room);
//             socket.to(data.room).emit("new-message", data.message);
//         })

//         socket.on("join-room", (data) => {
//             const roomName = typeof data === "object" && data?.room ? data.room : data;
//             console.log("Joined room:", roomName);
//             socket.join(String(roomName));
//         })


//         socket.on("disconnect", (reason) => {
//             console.log("Disconnected successfully.");
//             console.log(reason);
//         })

//     })


// }

// socket/index.js
import jwt from "jsonwebtoken";
import ChatMessageModel from "../model/chatMessage.model.js";
import InterviewRoomModel from "../model/room.model.js";
import InterviewModel from "../model/interview.model.js";

export const initializeSocket = (io) => {
  // 1. Socket Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: Token missing"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Contains userId and role
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // 2. Join Room Event
    socket.on("join_room", async ({ roomCode }, callback) => {
      try {
        const room = await InterviewRoomModel.findOne({ roomCode });
        if (!room) {
          return callback?.({ status: "error", message: "Room not found" });
        }

        const interview = await InterviewModel.findById(room.interviewId)
          .populate("candidateId")
          .populate("interviewerId");

        // Verify the user is either the candidate or the interviewer for this room
        const isCandidate = interview.candidateId.userId.equals(socket.user.id);
        const isInterviewer = interview.interviewerId.userId.equals(socket.user.id);

        if (!isCandidate && !isInterviewer) {
          return callback?.({ status: "error", message: "Unauthorized access" });
        }

        // Join room channel
        const roomName = `interview:${roomCode}`;
        socket.join(roomName);

        socket.to(roomName).emit("user_connected", {
          userId: socket.user.id,
          role: socket.user.role,
        });

        callback?.({ status: "ok" });
      } catch (err) {
        callback?.({ status: "error", message: "Failed to join room" });
      }
    });

    // 3. Send & Receive Message
    socket.on("send_message", async ({ roomCode, message }) => {
      if (!message || !message.trim()) return;

      const room = await InterviewRoomModel.findOne({ roomCode });
      if (!room) return;

      // Persist to MongoDB
      const newMsg = await ChatMessageModel.create({
        interviewId: room.interviewId,
        senderId: socket.user.id,
        senderRole: socket.user.role,
        message,
      });

      const messagePayload = {
        _id: newMsg._id,
        senderId: socket.user.id,
        senderRole: socket.user.role,
        message: newMsg.message,
        createdAt: newMsg.createdAt,
      };

      // Broadcast to EVERYONE in this interview room (including sender)
      io.to(`interview:${roomCode}`).emit("receive_message", messagePayload);
    });

    // 4. Disconnect Handler
    socket.on("disconnect", (reason) => {
      // Socket.io automatically cleans up internal room associations
      console.log("Disconnected successfully.");
      console.log(reason);
    });
  });
};