const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        email: String,
        subject: String,
        description: String,
        number: Number,
        file_attachments:String,
        status: String,
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
        //published: Boolean
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
   const Ticket = mongoose.model("tickets", schema);
   return Ticket
  };
  