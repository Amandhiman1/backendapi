// routes/blogcategory.js

module.exports = (app) => {
  
    var router = require("express").Router();
    const blogController = require("../controllers/blog.cat.controller");
    const {authenticateToken} = require("../middleware/auth.js")

    // Create a new blog cat
    router.post("/", authenticateToken, blogController.createBlogcat);
  
    // Get all blog cat
    router.get("/", blogController.getAllBlogscat);
  
    // Get a single blog cat
    router.get("/blogcats/:id", blogController.getBlogcatById);
  
    // Update a blog cat
    router.put("/blogcats/:id", blogController.updateBlogcat);
  
    // Delete a blog cat
    router.delete("/blogcats/:id", blogController.deleteBlogcat);
  
    app.use("/api/blogcat", router);
  };
  