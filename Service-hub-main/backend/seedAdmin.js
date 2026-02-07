const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config({ path: './.env' });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://brijeshzhaaa:b1fcT4RaeSq8QZKb@cluster0.lhxc4rg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log('MongoDB Connected');

        const adminEmail = 'admin@servicehub.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const newAdmin = new User({
            name: 'Super Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            phone: '1234567890'
        });

        await newAdmin.save();
        console.log('Admin created successfully');
        console.log('Email: admin@servicehub.com');
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
