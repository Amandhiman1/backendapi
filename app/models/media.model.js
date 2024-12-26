const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      image: String,
      type: String,
      category: String,
      subcategory: String,
      alt: String,
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
      //published: Boolean
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const {_id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Media = mongoose.model("media", schema);
  return Media;
};
