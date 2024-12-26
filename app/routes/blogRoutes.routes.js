const db = require("../models");
const multer = require("multer");
const path = require("path");
var router = require("express").Router();
const blogController = require("../controllers/blog.controller");
const { authenticateToken } = require("../middleware/auth.js")

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

// Create a new blog post
router.post("/", authenticateToken, upload.single("image"), blogController.createBlog);

// Get all blog posts
router.get("/", blogController.getAllBlogs);

// Get a single blog post by slug
router.get("/:slug", blogController.getBlogBySlug);

// Update a blog post by slug
router.put("/:slug", authenticateToken, upload.single("image"), blogController.updateBlogBySlug);

// Delete a blog post by slug
router.delete("/:id", authenticateToken, blogController.deleteBlogById);

// Get blogs by category slug
router.get("/category/:categorySlug", blogController.getBlogsByCategorySlug);

// Like a blog post
router.post("/:slug/like", blogController.likeBlog);

// Dislike a blog post
router.post("/:slug/dislike", blogController.dislikeBlog);

module.exports = (app) => {
  app.use("/api/blog", router);
};
