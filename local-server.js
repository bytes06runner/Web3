import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Import Handlers
import registerHandler from './api/auth/register.js';
import loginHandler from './api/auth/login.js';
import usersHandler from './api/users.js';
import puzzleHandler from './api/puzzle.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock Vercel Request/Response for handlers
const createHandler = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (e) {
        console.error(e);
        if (!res.headersSent) res.status(500).json({ error: e.message });
    }
};

app.post('/api/auth/register', createHandler(registerHandler));
app.post('/api/auth/login', createHandler(loginHandler));
app.get('/api/users', createHandler(usersHandler));
app.post('/api/puzzle', createHandler(puzzleHandler));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Local API Server running on port ${PORT}`);
});
