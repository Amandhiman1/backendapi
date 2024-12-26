const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      articleData: {
        type: Object,
        required: true,
      },
      slug: {
        type: String,
        required: true,
      },
      faqCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "faqCategory",
      },
      faqQuestion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "faqQuestion",
      },
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
    },
    { timestamps: true }
  );

  const faqArticleModel = mongoose.model("faqArticle", schema);
  return faqArticleModel;
};
