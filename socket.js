const io = require("socket.io")(8000, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
});

let users = [];

const addUser = (userId, socketId, userInfo) => {
  const ckeckUser = users.some((u) => u.userId === userId);
  if (!ckeckUser) {
    users.push({
      userId,
      socketId,
      userInfo,
    });
  }
};
const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};
const findFriend = (id) => {
  return users.find((u) => u.userId === id);
};
io.on("connection", (socket) => {
  console.log("connection successfully.....");
  socket.on("addUser", (userId, userInfo) => {
    addUser(userId, socket.id, userInfo);
    io.emit("getUsers", users);
  });
  socket.on("sendMessage", (data) => {
    console.log(data);
    const user = findFriend(data.reciverId);
    console.log("this is the sender", user);
    if (user !== undefined) {
      socket.to(user.socketId).emit("getMessage", {
        senderId: data.senderId,
        senderName: data.senderName,
        reciverId: data.reciverId,
        createdAt: data.time,
        message: {
          text: data.message.text,
          image: data.message.image,
        },
      });
    }
    console.log(users);
  });
  socket.on("typingMessage", (data) => {
    const user = findFriend(data.reciverId);
    console.log("this is the sender", user);
    if (user !== undefined) {
      socket.to(user.socketId).emit("typingMessageGet", {
        senderId: data.senderId,
        reciverId: data.reciverId,
        msg: data.msg,
      });
    }
  });
  socket.on("disconnect", () => {
    console.log("user disconnected successfully ....");
    removeUser(socket.id);
    io.emit("getUser", users);
  });
});
