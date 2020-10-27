import path from "path";
import http from "http";
import express from "express";
import socketio from "socket.io";
import Filter from "bad-words";
import { generateMessage, generateLocationMessage } from "./utils/messages";
import {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  User,
} from "./utils/users";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {
  socket.on("join", (userData, callback) => {
    const result = addUser({
      id: socket.id,
      ...userData,
    });

    if (result.error) {
      return callback(result.error);
    }

    const { user } = result as { user: User };

    socket.join(user.room);

    socket.emit("message", generateMessage("Server", "Welcome"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Server", `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);

    if (filter.isProfane(message)) {
      return callback("No profanity, bitch.");
    }

    io.to(user!.room).emit("message", generateMessage(user!.username, message));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Server", `${user.username} has disconnected`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);

    io.to(user!.room).emit(
      "locationMessage",
      generateLocationMessage(
        user!.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback("Location has been shared");
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
