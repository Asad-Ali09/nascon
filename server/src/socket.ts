// sockets.ts
import { Server, Socket } from "socket.io";
import http from "http";

const activeUsers: Record<string, Set<string>> = {}; // { [courseId]: Set<socketId> }

export const setupSockets = (server: http.Server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join course room
    socket.on("joinCourse", (courseId: string) => {
      if (!activeUsers[courseId]) {
        activeUsers[courseId] = new Set();
      }
      activeUsers[courseId].add(socket.id);
      socket.join(courseId);
      console.log(`${socket.id} joined ${courseId}`);
    });

    // Broadcast message to course room
    socket.on("sendMessage", (data: { courseId: string; text: string }) => {
      if (!data.courseId || !data.text) return;
      io.to(data.courseId).emit("newMessage", data);
    });

    // Cleanup
    socket.on("disconnect", () => {
      Object.keys(activeUsers).forEach((courseId) => {
        if (activeUsers[courseId].has(socket.id)) {
          activeUsers[courseId].delete(socket.id);
          if (activeUsers[courseId].size === 0) {
            delete activeUsers[courseId];
          }
        }
        console.log(`${socket.id} disconnected`);
      });
    });
  });

  return io;
};
