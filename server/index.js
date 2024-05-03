const express = require('express');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbConnect } = require('./util/dbConnect');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Test MongoDB connection
app.get('/test', async (req, res) => {
    try {
        await dbConnect();
        res.send('Connected to mongo');
    } catch (error) {
        res.send('Failed to connect to mongo: ' + error.message);
    }
});

// Register Admin Endpoint
app.get('/regAdmin', async (req, res) => {
    try {
        await dbConnect();
        const admin = new User({
            contactInfo: {
                email: 'admin@example.com',
                mobileNumber: '1234567890'
            },
            basicInfo: {
                firstName: 'Admin',
                lastName: 'User',
                dob: new Date('1990-01-01'),
                gender: 'MALE'
            },
            authInfo: {
                password: process.env.TEST_USER_PASSWORD
            },
            userType: 'ADMIN',
            status: 'ACTIVE'
        });

        await admin.save();
        console.log('Admin user created with hashed password:', admin.authInfo.password);
        res.send('Admin user created');
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.send('Error creating admin user: ' + error.message);
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        await dbConnect();
        const user = await User.findOne({'contactInfo.email': username, userType: 'ADMIN'});
        if (!user) {
            return res.status(401).send({ message: 'Authentication failed' });
        }
        if (!bcrypt.compareSync(password, user.authInfo.password)) {
            return res.status(401).send({ message: 'Authentication failed' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ message: 'Server error' });
    }
});

// Add User Endpoint
app.post('/users', async (req, res) => {
    const { token } = req.headers;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await User.findById(decoded.userId);
        if (admin.userType !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized' });
        }
        const { email, userType, status, firstName, lastName, dob, gender, mobileNumber } = req.body;
        const newUser = new User({
            contactInfo: {
                email,
                mobileNumber
            },
            basicInfo: {
                firstName,
                lastName,
                dob,
                gender
            },
            authInfo: {
                password: ''  // Password will be empty initially for 'ONBOARD' users
            },
            userType,
            status
        });
        await newUser.save();
        res.status(201).send({ message: 'User added' });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).send({ message: 'Error adding user: ' + err.message });
    }
});

// Get Users Endpoint
app.get('/users', async (req, res) => {
    const { token } = req.headers;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await User.findById(decoded.userId);
        if (admin.userType !== 'ADMIN') {
            return res.status(401).send({ message: 'Unauthorized' });
        }
        const users = await User.find({ userType: 'USER' });
        res.send(users);
    } catch (err) {
        console.error('Error retrieving users:', err);
        res.status(500).send({ message: 'Error retrieving users: ' + err.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
