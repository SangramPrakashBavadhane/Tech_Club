import mongoose from 'mongoose';

const dsaProblemSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    topic: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

const DsaProblem = mongoose.model("DsaProblem", dsaProblemSchema);
export default DsaProblem;  