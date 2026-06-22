import express from 'express'
import DsaProblem from '../models/DsaProblem.js'
import User from '../models/user.js';
import { requireAuth, requireCouncilOrPresident } from '../middleware/auth.js';


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

router.get(
    '/users',
    requireAuth,
    requireCouncilOrPresident,
    async (req, res) => {
        try {
            // Query the database for all users, selecting only their username, role, solvedProblems, academicYear, department, and interestTags fields
            const users = await User.find({}, 'username role solvedProblems academicYear department interestTags');

            // Loop through users and build the directory data
            const userDirectory = users.map(u => ({
                id: u._id,
                username: u.username,
                role: u.role,
                solvedCount: u.solvedProblems ? u.solvedProblems.length : 0,
                academicYear: u.academicYear,
                department: u.department,
                interestTags: u.interestTags || []
            }));
            // Send the directory list as JSON to the frontend
            res.status(200).json(userDirectory);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// GET /api/dsa/solved/:userId
// WHY: Retrieves the array of solved question IDs for a specific student.
// RESTRICTION: Only accessible by 'council' or 'president'
router.get('/solved/:userId', requireAuth, requireCouncilOrPresident, async (req, res) => {
    try {
        // req.params.userId reads the ID value from the URL parameter (:userId)
        const student = await User.findById(req.params.userId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Return the student's solved array (defaulting to empty [] if they haven't solved any yet)
        res.status(200).json({ solvedProblems: student.solvedProblems || [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});





export default router;