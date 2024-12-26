const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        titles: Object,
        slug: String,
        category: Object,
        categorySlug: String,
        contents: Object,
        imageUrl: String,
        shortDesc: Object,  // Added field
        imageAlt: Object,   // Added field
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        likes: { type: Number, default: 0 },       // Added field
        dislikes: { type: Number, default: 0 },    // Added field
      },
      { timestamps: true }
    );
  
    const Blog = mongoose.model("Blog", schema);
    return Blog;
};
