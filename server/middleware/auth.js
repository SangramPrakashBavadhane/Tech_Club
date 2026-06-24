import jwt from 'jsonwebtoken';
import User from '../models/user.js';


export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'syntax_secret_key');

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(401).json({ message: 'Request is not authorized' });
    }
};


export const requireCouncilOrPresident = (req, res, next) => {

    if (!req.user || (req.user.role !== 'council' && req.user.role !== 'president')) {
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    next();
};

export const requirePresident = (req, res, next) => {
    if (!req.user || req.user.role !== 'president') {
        return res.status(403).json({ message: 'Access denied: President privileges required' });
    }
    next();
};



