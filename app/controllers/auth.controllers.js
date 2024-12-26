const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { getUserFromToken } = require('../middleware/auth');
const roles = require('../config/roles.config')

// Generate JWT tokens
function generateAccessToken(user, expiresIn) {
    return jwt.sign({
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: user.role,
        permissions: roles[user.role],
        languagePermissions: user.languagePermissions
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
}

function generateRefreshToken(user) {
    return jwt.sign({
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: user.role
    }, process.env.REFRESH_TOKEN_SECRET);
}

// Function to generate a TOTP secret
function generateTwoFactorSecret() {
    return speakeasy.generateSecret({ length: 20 });
}

// Function to generate QR code for TOTP
async function generateQrCode(secret, email) {
    const otpauthUrl = speakeasy.otpauthURL({
        secret: secret.base32,
        label: email,
        issuer: 'Vmaan',
        encoding: 'base32'
    });

    const qrCode = await qrcode.toDataURL(otpauthUrl);
    return qrCode;
}



// Signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password, mobile, designation, role, empId, userType,languagePermissions  } = req.body;
        const user = new User({ name, email, password, mobile, designation, role, empId, userType, languagePermissions });
        const userRes = await user.save();
        res.status(201).send({message: 'User created successfully', data: userRes});
    } catch (err) {
        res.status(400).send({message: err.message || 'Some error occurred while creating the user'});
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send({message:'User not found'});
        console.log(user.password);
        

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(403).send({message: 'Invalid credentials'});

        const accessToken = generateAccessToken(user, process.env.REFRESH_TOKEN_EX_TIME);
        const refreshToken = generateRefreshToken(user);
        user.refreshToken = refreshToken;
        
        await user.save();

        res.json({ accessToken, refreshToken, user, isTwoFactorEnabled: user.isTwoFactorEnabled});
    } catch (err) {
        res.status(400).send({message: err.message || 'Some error occurred while login'});
    }
};

// Token Refresh
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).send({message: 'Unauthorized'});

    try {
        const user = await User.findOne({ refreshToken });
        if (!user) return res.status(403).send({message: 'Forbidden'});

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).send({message: 'Forbidden'});
            const accessToken = generateAccessToken(user, process.env.REFRESH_TOKEN_EX_TIME);
            res.json({ accessToken });
        });
    } catch (err) {
        res.status(500).send({message: err.message || 'Some error occurred'});
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        console.log(req.user)
        const user = req.user;
        const dbUser = await User.findById(user.id);
        if (!dbUser) return res.status(400).send({message:'User not found'});

        dbUser.refreshToken = null;
        await dbUser.save();
        res.sendStatus(204);
    } catch (err) {
        res.status(500).send({message: err.message || 'Some error occurred'});
    }
};


exports.enableTwoFactorAuthentication = async (req, res)=> {

    try {
        const userId = req.user.id; 
        const user = await User.findById(userId);

        if (!user) {
            console.error('Enable 2FA error: User not found');
            return res.status(404).send({message:'User not found'});
        }


        const secret = generateTwoFactorSecret();
        user.twoFactorSecret = secret.base32;
        user.isTwoFactorEnabled = true;
        await user.save();

        const qrCode = await generateQrCode(secret, user.email);
        res.json({ message: `Two-factor authentication enabled for user: ${user.email}`, qrCode });
    } catch (err) {
        res.status(500).send({message: err.message || 'Some error occurred'}); 
    }
    
}

 exports.verifyTwoFactorAuthentication = async(req, res)=> {
    const { totp } = req.body;
    try {
        const user = req.user;
        const dbUser = await User.findById(user.id);
        const last_logged_in = dbUser.last_logged_in;
        if (!dbUser) return res.status(404).send({message:'User not found'});
        if (!dbUser.isTwoFactorEnabled) return res.status(400).send({message:'Two-factor authentication is not enabled for this user'});

        const isVerified = speakeasy.totp.verify({
            secret: dbUser.twoFactorSecret,
            encoding: 'base32',
            token: totp
        });
        
        if (!isVerified) return res.status(403).send({message: 'Invalid or expired 2FA token'});
        dbUser.last_logged_in = new Date();
        await dbUser.save();
        const accessToken = generateAccessToken(dbUser, process.env.ACCESS_TOKEN_EX_TIME);
        res.json({ accessToken, last_logged_in });
    } catch (err) {
        res.status(500).send({message: err.message || 'Some error occurred'});
    }
}
