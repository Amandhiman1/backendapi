module.exports = (app) => {
  const multer = require('multer');
  const media = require("../controllers/media.controller.js");
  const path = require('path');
  var router = require("express").Router();

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "./uploads");
      },
      filename: (req, file, cb) => {
        cb(null, file.fieldname+ '-' + Date.now() + path.extname(file.originalname))
      }
    })
  });

  // Create a new Tutorial
  router.post("/",upload.single('image'), media.create);
  router.post("/filter", media.filter);

  // Retrieve all media
  router.get("/", media.findAll);

  // Retrieve all published media
  router.get("/published", media.findAllPublished);

  // Retrieve a single Tutorial with id
  router.get("/:id", media.findOne);

  // Update a Tutorial with id
  router.put("/:id", media.update);

  // Delete a Tutorial with id
  router.delete("/:id", media.delete);

  // Create a new Tutorial
  router.delete("/", media.deleteAll);

  app.use("/api/media", router);
};
