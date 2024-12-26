const db = require("../models");
const Blog = db.blog;

// Function to generate slug from title
const generateSlug = (title) => {
    console.log(title);
    
    return title
        .toLowerCase()                 // Convert to lowercase
        .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
        .trim()                        // Trim whitespace from both ends
        .replace(/\s+/g, '-');         // Replace spaces with hyphens
};

// Create a new blog post
exports.createBlog = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.user);

        const { titles, contents, category, shortDesc, imageAlt } = req.body;
        console.log(titles.en);
        console.log(category);
        
        const slug = generateSlug(titles.en);
        const newBlog = new Blog({
            titles,
            slug,
            category,
            categorySlug: generateSlug(category.en),
            contents,
            imageUrl: req.file ? req.file.filename : null,
            shortDesc,
            imageAlt,
            createdBy: req.user.id
        });
        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all blog posts
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single blog post by slug
exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get blogs by category slug
exports.getBlogsByCategorySlug = async (req, res) => {
    try {
        const blogs = await Blog.find({ categorySlug: req.params.categorySlug });
        if (!blogs) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a blog post by slug
exports.updateBlogBySlug = async (req, res) => {
    try {
        const { titles, contents, category, shortDesc, imageAlt } = req.body;

        // Generate a new slug based on the updated title
        const newSlug = generateSlug(titles.en);

        // Build the update object
        const updateFields = { titles, slug: newSlug, category, contents, shortDesc, imageAlt, categorySlug: generateSlug(category.en) };

        // If a new image file is uploaded, include its filename in the update
        if (req.file) {
            updateFields.imageUrl = req.file.filename;
        }

        // Find and update the blog post by the original slug
        const updatedBlog = await Blog.findOneAndUpdate(
            { slug: req.params.slug },
            updateFields,
            { new: true }
        );

        // If no blog post is found, return a 404 status with an error message
        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Return the updated blog post in the response
        res.json(updatedBlog);
    } catch (err) {
        // Return a 400 status with an error message in case of an error
        res.status(400).json({ message: err.message });
    }
};

// Delete a blog post by slug
exports.deleteBlogById = async (req, res) => {
    try {
        const deletedBlog = await Blog.findOneAndDelete({ id: req.params.id });
        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Like a blog post
exports.likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { likes: 1 } },
            { new: true }
        );
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Dislike a blog post
exports.dislikeBlog = async (req, res) => {
    try {
        const blog = await Blog.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { dislikes: 1 } },
            { new: true }
        );
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
