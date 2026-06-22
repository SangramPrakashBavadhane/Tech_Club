import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'unsername is required'],
            unique: true,
            trim: true,
            minlength: [3, 'username must be atleast 3 characters long']
        },
        department: {
            type: String,
            required: true,
            enum: ["CSE", "ECE", "EEE", "MECH", "CHEM", "CIV", "META", "MIN"]
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: [6, 'password must be atleast 6 characters long']
        },
        role: {
            type: String,
            enum: ['pending', 'active', 'council', 'president'],
            default: 'pending'
        },
        academicYear: {
            type: Number,
            enum: [1, 2, 3, 4],
            required: true
        },
        interestTags: [{
            type: String
        }],
        solvedProblems: [{
            type: Number
        }],


    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;

