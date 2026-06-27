const onlineUsers = new Map();

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(
      `[Socket Link] Persistent connection established: ${socket.id}`,
    );

    socket.on("join_chat", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit("get_online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("send_message", (message) => {
      if (!message || !message.recipient) return;
      const recipientSocketId = onlineUsers.get(message.recipient._id);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive_message", message);
      }
    });

    socket.on("typing", (data) => {
      const recipientSocketId = onlineUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("typing", { senderId: data.senderId });
      }
    });

    socket.on("stop_typing", (data) => {
      const recipientSocketId = onlineUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("stop_typing", {
          senderId: data.senderId,
        });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("get_online_users", Array.from(onlineUsers.keys()));
        console.log(
          `[Socket Disconnect] Active user trace dropped: ${socket.id}`,
        );
      }
    });
  });
};
