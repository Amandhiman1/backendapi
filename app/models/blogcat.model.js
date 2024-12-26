const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        title: Object,
        slug: String,
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
      },
      { timestamps: true }
    );
  
    const Blogcat = mongoose.model("Blogcat", schema);
    return Blogcat;
};
