
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming req.user is set by the middleware
        const updates = req.body; // Get updates from the request body

        // Find the user and update the profile
        const user = await User.findByIdAndUpdate(userId, updates, { new: true });

        if (!user) {
            console.error({ message: 'Update profile error: User not found' });
            return res.status(404).send({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).send({ message: error.message || 'Some error occurred while updating the user ' });
    }
};


exports.createUser = async (req, res) => {
    try {
        const { name, email, mobile, designation, role, empId, userType, languagePermissions, report_to } = req.body;
        const firstName = name?.split(' ')[0]
        const password = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() + '123'
        console.log(password);

        if (req.user.role === 'Admin' && role === 'Admin') {
            return res.status(403).send({ message: 'Admin users cannot create other Admin users' });
        }

        if (req.user.role === 'Manager' && role !== 'TeamLead' && role !== 'Executive') {
            return res.status(403).send({ message: 'Managers can only create TeamLead or Executives' });
        }
        if (req.user.role === 'TeamLead' && role !== 'Executive') {
            return res.status(403).send({ message: 'TeamLead can only create Executives' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const dbuser = await User.findOne({ email });
        if (dbuser) return res.status(409).send({ message: 'User already exist' });

        const user = new User({ name, email, password: hashedPassword, mobile, designation, role, empId, userType, languagePermissions });
        user.createdBy = req.user._id;
        user.report_to = report_to ? report_to : req.user._id;

        const userRes = await user.save();
        res.status(201).send({ message: 'User created successfully', data: userRes });
    } catch (err) {
        console.error('User creation error:', err);
        res.status(400).send({ message: err.message || 'Some error occurred while creating the user ' });
    }
};

async function findAllReportingUsers(userId) { //zafar

    const users = await User.find({ report_to: userId }).select('-password -isTwoFactorEnabled -refreshToken -twoFactorSecret');
    if (users.length === 0) return;

    // for (const user of directReports) {
    //     allUsers.push(user);
    //     await findAllReportingUsers(user._id, allUsers);  // Recursive call for deeper levels
    // }
    return users
}

exports.getUserList = async (req, res) => {
    try {
        let users = [];
        console.log("asdasdsad987", req.user.role)
        if (req.user.role === 'Admin') {
            // Admin can see all users
            users = await User.find({ role: 'Manager' }).select('-password -isTwoFactorEnabled -refreshToken -twoFactorSecret');
        } else if (req.user.role === 'Manager' || req.user.role === 'TeamLead') {
            // Manager can see their team's users (Team Leads and Executives created by them)
            // users = await User.find({ report_to: req.user._id }).select('-password -isTwoFactorEnabled -refreshToken -twoFactorSecret');
            console.log("users987", users)
            users = await findAllReportingUsers(req.user._id);
        } else if (req.user.role === 'Executive') {
            // Executives cannot see the user list
            return res.status(403).send({ message: 'You do not have the required permissions to perform this action' });
        } else {
            return res.status(403).send({ message: 'You do not have the required permissions to perform this action' });
        }

        res.status(200).send(users);
    } catch (err) {
        console.error('Get user list error:', err);
        res.status(400).send({ message: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        let user = await User.findById(id).select('-password -isTwoFactorEnabled -refreshToken -twoFactorSecret')

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(user);
    }
    catch (err) {
        console.error('Get user by id error:', err);
        res.status(400).send({ message: err.message });
    }
}

exports.getUserByIds = async (req, res) => {
    try {
        console.log("req.params.userid*************", req.params.userid)
        const reportToId = req.params.userid;

        // Find users whose report_to field matches the specified userid
        const users = await User.find({ report_to: reportToId }).populate({
            path: 'report_to',
            select: 'name role'
        }).select('-password -isTwoFactorEnabled -refreshToken -twoFactorSecret')

        if (users.length === 0) {
            return res.status(404).send({ message: 'No users found reporting to this user ID' });
        }

        res.status(200).send(users);
    } catch (err) {
        console.error('Get users by report_to ID error:', err);
        res.status(400).send({ message: err.message });
    }
};