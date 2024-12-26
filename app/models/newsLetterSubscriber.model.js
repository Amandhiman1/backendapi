const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true
      },
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
    });
  
    const newsletterSubscriber = mongoose.model("newsletter-subscriber", schema);
    return newsletterSubscriber;
  };
  