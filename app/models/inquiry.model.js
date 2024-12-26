const { airlines } = require(".");

module.exports = (mongoose) => {
  var commentSchema = mongoose.Schema(
    {
      user: String,
      comment: String,
      status: String,
    },
    { timestamps: { createdAt: "timestamp" } }
  );

  var schema = mongoose.Schema(
    {
      name: String,
      email: String,
      phone: Number,
      formData: Object,
      offerId: String,
      type: String,
      status: String,
      originCounty: String,
      originCity: String,
      destinationCountry: String,
      destinationCity: String, 
      originCode: String,
      destinationCode: String,
      airlines: { type: String, default: null }, // Set default value to null
      comments: [commentSchema],
      // Origin: Object,
      // Destination: Object,
      // Type: String,
      // Dates: Object,
      // Travelers: Object,
      // Cabin: String
    },
    { timestamps: true }
  );

  const Inquiry = mongoose.model("inquiries", schema);
  return Inquiry;
};