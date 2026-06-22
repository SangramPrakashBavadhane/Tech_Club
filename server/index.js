import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import dsaRoutes from './routes/dsa.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config({ path: '../.env' });






const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/syntax_club';

app.use(cors());
app.use(express.json());
app.use('/api/dsa', dsaRoutes);


app.use('/api/auth', authRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const userSockets = {};
io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    socket.on('register-user', (userId) => {
        if (userId) {
            userSockets[userId] = socket.id;
            socket.userId = userId;
            console.log(`user:${userId} registered socket:${socket.id}`);
        }
    });

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', userId);

    });

    socket.on('signal', (data) => {
        socket.to(data.roomId).emit('signal', data);
    });

    socket.on('invite-student', (data) => {
        const targetSocketId = userSockets[data.studentId];
        if (targetSocketId) {
            console.log(`Sending invite from CM to target socket: ${targetSocketId}`);
            io.to(targetSocketId).emit('incoming-invite', data);
        } else {
            console.log(`Student ${data.studentId} is offline. Invite not sent.`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket client disconnected: ${socket.id}`);
        if (socket.userId) {
            delete userSockets[socket.userId];
        }
    });



});


mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Succesfully connected mongoDB');
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error: ', error.message);
    })

