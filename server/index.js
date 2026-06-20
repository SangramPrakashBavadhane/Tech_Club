import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import dsaRoutes from './routes/dsa.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/syntax_club';

app.use(cors());
app.use(express.json());
app.use('/api/dsa', dsaRoutes);


app.use('/api/auth', authRoutes);

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Succesfully connected mongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error: ', error.message);
    })

