const db = require("../models");
const Blog = db.Blogcat;

// Function to generate slug from title
const generateSlug = (title) => {
    return title.toLowerCase().replace(/ /g, '-');
};

// Create a new blog cat
exports.createBlogcat = async (req, res) => {
    try {
        const { title } = req.body;
        console.log(req.user);
        const slug = generateSlug(title.en);
        const newBlog = new Blog({
            title,
            slug,
            createdBy: req.user.id
        });
        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all blog cat
exports.getAllBlogscat = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single blog cat
exports.getBlogcatById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog Cat not found' });
        }
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a blog cat
exports.updateBlogcat = async (req, res) => {
    try {
        const { title, content } = req.body;
        const slug = generateSlug(title);
        const updateFields = {
            title,
            slug
           
        };
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog cat not found' });
        }
        res.json(updatedBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a blog cat
exports.deleteBlogcat = async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json({ message: 'Blog Cat deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
