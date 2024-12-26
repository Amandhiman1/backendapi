const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose => {
    var schema = mongoose.Schema(
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        cvFile: { type: String, required: true },  
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true }, 
      },
      { timestamps: true }
    );

    const JobApplication = mongoose.model("JobApplication", schema);
    return JobApplication;
};
