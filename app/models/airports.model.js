const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      airport_id: String,
      airport_type: String,
      airport_name: String,
      city_code: String,
      country_code: String,
      code: String,
      english: String,
      spanish: String,
      latitude: String,
      longitude: String,
      //published: Boolean
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const {_id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Airports = mongoose.model("airports", schema);
  return Airports;
};
