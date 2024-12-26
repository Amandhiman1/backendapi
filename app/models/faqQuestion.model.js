const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      name: {
        type: Object,
        required: true,
      },
      slug: {
        type: String,
        required: true,
        unique: true,
      },
      faqCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "faqCategory",
      },
      faqArticles: [
        {
          title: Object,
          slug: String,
        },
      ],
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
    },
    { timestamps: true }
  );

  const FAQQuestion = mongoose.model("faqQuestion", schema);
  return FAQQuestion;
};
