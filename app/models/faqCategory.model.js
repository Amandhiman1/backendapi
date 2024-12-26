const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      title: {
        type: Object,
        required: true,
      },
      slug: {
        type: String,
        required: true,
        unique: true,
      },
      questions: [
        {
          questionid: mongoose.Schema.Types.ObjectId,
          title: Object,
          slug: String,
        },
      ],
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
    },
    { timestamps: true }
  );

  const FAQCategory = mongoose.model("faqCategory", schema);
  return FAQCategory;
};
