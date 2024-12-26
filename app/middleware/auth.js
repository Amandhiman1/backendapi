// middleware/auth.js
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const User = require('../models/user.model');

// Authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send({message: 'Unauthorized'});

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).send({message: 'Unauthorized'})

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) return res.status(403).send({message: 'Forbidden'});
        const dbUser = await User.findById(user.id);
        
        if (!dbUser) return res.status(403).send({message: 'Forbidden'});
        let userObj = dbUser.toObject()
        userObj.id= userObj._id.toString()
        req.user = {
            ...userObj,
            permissions: user.permissions,
            languagePermissions: user.languagePermissions
        };
        next();
    });
}

// Verify 2FA token middleware
function verify2FA(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send({message: 'Unauthorized'});

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).send({message: 'Unauthorized'});

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            console.log(err);
            return res.status(403).send({message: 'Invalid or expired 2FA token'});
        }

        const dbUser = await User.findById(user.id);
        if (!dbUser || !dbUser.isTwoFactorEnabled) {
            return res.status(403).send({message: '2FA is not enabled for this user'});
        }

        const isVerified = speakeasy.totp.verify({
            secret: dbUser.twoFactorSecret,
            encoding: 'base32',
            token: req.body.totp
        });

        if (!isVerified) {
            return res.status(403).send({message: 'Invalid or expired 2FA token'});
        }

        let userObj = dbUser.toObject()
        userObj.id= userObj._id.toString()
        req.user = {
            ...userObj,
            permissions: user.permissions,
            languagePermissions: user.languagePermissions
        };
        next();
    });
}

// Check if the user's session is still valid
function checkSession(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).send({message: 'No authorization header'});
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send({message: 'No token provided'});
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({message: 'Session expired'});
        }
        req.user = user;
        next();
    });
}

// Check if user has required permissions
function authorizePermissions(requiredRoles = [], requiredPermissions = []) {
    return (req, res, next) => {
        const userRole = req.user.role;
        const userPermissions = req.user.permissions || [];

        const hasRole = requiredRoles.length === 0 || requiredRoles.includes(userRole);
        const hasPermissions = requiredPermissions.length === 0 || requiredPermissions.every(permission => userPermissions.includes(permission));

        if (!hasRole || !hasPermissions) {
            console.error('User does not have required permissions or role');
            return res.status(403).send({message:'You do not have the required permissions or role to perform this action'});
        }

        next();
    };
}

// Get user details from token
async function getUserFromToken(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new Error('Token is required');

    const token = authHeader.split(' ')[1];
    if (!token) throw new Error('Token is required');

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        role: user.role
    };
}

module.exports = { authenticateToken, verify2FA,authorizePermissions, getUserFromToken, checkSession };
