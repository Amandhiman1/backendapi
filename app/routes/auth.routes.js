module.exports = app => {
    const auth = require("../controllers/auth.controllers");
    const { authenticateToken, verify2FA, checkSession } = require("../middleware/auth");

    let router = require("express").Router();

    router.post("/signup", auth.signup);
    router.post("/login", auth.login);
    router.get("/logout",authenticateToken, auth.logout);
    router.post("/token", auth.refreshToken);
    router.get('/check', checkSession, (req, res) => {
        res.status(200).send({message:'Session is valid'});
    });

    router.post("/enable-2fa",authenticateToken, auth.enableTwoFactorAuthentication);
    router.post("/verify-2fa",authenticateToken, verify2FA, auth.verifyTwoFactorAuthentication);

    app.use("/api/auth", router);
}