import express from 'express'
import DsaProblem from '../models/DsaProblem.js'
import User from '../models/user.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.get('/problems', async (req, res) => {
    try {
        const problems = await DsaProblem.find({}).sort({ id: 1 });
        res.status(200).json(problems);

    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// GET /api/dsa/solved
// WHY: Gets the list of solved problem IDs for the authenticated user from MongoDB.
router.get('/solved', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ solvedProblems: user?.solvedProblems || [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/dsa/toggle
// WHY: Adds the problemId to the user's solvedProblems array in MongoDB if it's missing, or removes it if it's already there.
router.post('/toggle', requireAuth, async (req, res) => {
    try {
        const { problemId } = req.body;
        if (typeof problemId !== 'number') {
            return res.status(400).json({ message: 'Valid problemId is required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.solvedProblems) {
            user.solvedProblems = [];
        }

        const index = user.solvedProblems.indexOf(problemId);
        if (index > -1) {
            user.solvedProblems.splice(index, 1); // Unchecked: remove from array
        } else {
            user.solvedProblems.push(problemId); // Checked: add to array
        }

        await user.save();

        // Return the updated list of solved problem IDs to the frontend
        res.status(200).json({ solvedProblems: user.solvedProblems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



export default router;