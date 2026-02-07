const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function deleteUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'brijeshkumar_jha@srmap.edu.in';
        const result = await User.deleteOne({ email });

        if (result.deletedCount > 0) {
            console.log(`User ${email} deleted successfully`);
        } else {
            console.log('User not found');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

deleteUser();
