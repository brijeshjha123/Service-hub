const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function migrateRoles() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await User.updateMany(
            { role: 'user' },
            { $set: { role: 'customer' } }
        );

        console.log(`Migration complete. Updated ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateRoles();
