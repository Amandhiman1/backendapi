const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      name: String,
      code: String,
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

  const Languages = mongoose.model("languages", schema);
  return Languages;
};
