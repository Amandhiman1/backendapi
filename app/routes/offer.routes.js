const { authenticateToken } = require("../middleware/auth");

module.exports = (app) => {
    const multer = require("multer");
    const path = require("path");
    var router = require("express").Router();
    const offerController = require("../controllers/offer.controller");
  
    const upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, "./uploads");
        },
        filename: (req, file, cb) => {
          cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
          );
        },
      }),
    });
  
    // Create a new offer
    router.post("/", upload.single("image"), authenticateToken, offerController.createOffer);
  
    // Get all offers
    router.get("/", offerController.getAllOffers);
  
    // Get a single offer by id
    router.get("/:id", offerController.getOfferById);
  
    // Update an offer by id
    router.put("/:id", upload.single("image"), authenticateToken, offerController.updateOfferById);
  
    // Delete an offer by id
    router.delete("/:id", authenticateToken, offerController.deleteOfferById);
  
    app.use("/api/offers", router);
  };
  