import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { requireAuth, requirePresident } from '../middleware/auth.js';


const router = express.Router();

router.post('/register', async (req, res) => {

    try {

        const { username, email, password, role, academicYear, interestTags, department } = req.body;

        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            academicYear,
            interestTags,
            department,
            role: 'pending'
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET || 'syntax_secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                department: newUser.department
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign({ id: user._id },
            process.env.JWT_SECRET || 'syntax_secret_key',
            { expiresIn: '7d' }

        );
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                department: user.department
            }
        })



    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/auth/update-role
// WHY: Allows the President to update the role of any student in MongoDB.
// RESTRICTION: Checked by requireAuth and requirePresident.
router.put('/update-role', requireAuth, requirePresident, async (req, res) => {
    try {
        const { userId, newRole } = req.body;

        // Validation check for correct enum values
        if (!['pending', 'active', 'council', 'president'].includes(newRole)) {
            return res.status(400).json({ message: 'Invalid role value specified.' });
        }

        // Find the student in the database
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target student not found.' });
        }

        // Save the new role
        targetUser.role = newRole;
        await targetUser.save();

        res.status(200).json({
            message: `Successfully promoted ${targetUser.username} to ${newRole}.`,
            user: {
                id: targetUser._id,
                username: targetUser.username,
                role: targetUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/auth/team
// WHY: Retrieves the public list of active team members (council members and the president).
// RESTRICTION: Publicly accessible
router.get('/team', async (req, res) => {
    try {
        const team = await User.find(
            { role: { $in: ['council', 'president'] } },
            'username role department'
        );
        res.status(200).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});







export default router;