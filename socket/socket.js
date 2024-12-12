import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingInterval: 25000,
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== 'undefined') {
    userSocketMap.set(userId, socket.id);
  }

  io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));

  socket.on('markMessagesAsSeen', async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, seen: false },
        { $set: { seen: true } },
      );
      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { 'lastMessage.seen': true } },
      );
      io.to(userSocketMap.get(userId)).emit('messagesSeen', { conversationId });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('sendMessageById', async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, seen: false },
        { $set: { seen: true } },
      );
      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { 'lastMessage.seen': true } },
      );
      io.to(userSocketMap.get(userId)).emit('messagesSeen', { conversationId });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('disconnect', () => {
    userSocketMap.forEach((value, key) => {
      if (value === socket.id) {
        userSocketMap.delete(key);
      }
    });
    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
  });
});

export { app, io, server };
