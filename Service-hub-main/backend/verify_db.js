const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        const userCount = await User.countDocuments();
        console.log(`📊 Total Users in Database: ${userCount}`);

        console.log('--- User List (Last 5) ---');
        const users = await User.find().sort({ createdAt: -1 }).limit(5);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [Role: ${u.role}]`);
        });

        console.log('\n💡 Note: Bookings are stored in Firebase Firestore, not MongoDB.');

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });
