const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema({
      language: {
        type: String,
        required: true
      },
      subject: {
        type: String,
        required: true
      },
      body: {
        type: String,
        required: true
      },
      status: {
        type: String,
        required: true,
        default: 'Not Sent'
      },
      createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
    }, {
      timestamps: true
    });
  
    const emailTemplate = mongoose.model("emailTemplate", schema);
    return emailTemplate;
  };
  