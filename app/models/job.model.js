const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            jobTitle: { type: Object, required: true },
            jobSlug:  { type: String, required: true },
            jobDesc:  { type: Object, required: true },
            location:  { type: String, required: true },
            department:  { type: String, required: true },
            createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false }
        },  
        { timestamps: true }
    );

    const job = mongoose.model("job", schema);
    return job;
};
