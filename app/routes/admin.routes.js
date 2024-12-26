module.exports = (app) => {
  const admin = require("../controllers/admin.controller.js");

  var router = require("express").Router();

  router.post("/login", admin.login);
  router.get("/checkLogin", admin.checkLogin);
  router.post("/logout", admin.logout);

  app.use("/api/admin", router);
};
