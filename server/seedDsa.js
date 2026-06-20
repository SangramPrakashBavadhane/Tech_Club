import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DsaProblem from './models/DsaProblem.js';

// Resolve path to load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/syntax_club';

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully!');

        // Read and parse the local striverSheet.json file we saved
        console.log('Reading striverSheet.json...');
        const jsonPath = path.join(__dirname, 'striverSheet.json');
        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        const topics = JSON.parse(fileContent);

        let totalUpserted = 0;

        // Loop categories and loop questions
        for (const topicData of topics) {
            const topicName = topicData.title;
            console.log(`Processing topic: "${topicName}" (${topicData.questions.length} problems)`);

            for (const question of topicData.questions) {
                // Upsert questions based on ID
                await DsaProblem.findOneAndUpdate(
                    { id: question.id },
                    {
                        id: question.id,
                        topic: topicName,
                        name: question.name,
                        platform: question.platform,
                        link: question.link
                    },
                    { upsert: true, new: true }
                );
                totalUpserted++;
            }
        }

        console.log(`\nSUCCESS: Database seeding completed! Loaded ${totalUpserted} problems.`);

    } catch (error) {
        console.error('Error during database seeding:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

seedDatabase();
