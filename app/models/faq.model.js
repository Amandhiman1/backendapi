const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            id: Number, // Serial number field
            title: String,
            text: String,
            createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
            task_id: { type: Schema.Types.ObjectId, ref: 'Task', required: false},
        },
        { timestamps: false }
    );

    // Pre-save hook to auto-generate and populate the id field
    schema.pre('save', function(next) {
        const doc = this;
        if (!doc.isNew) {
            // If document is not new, do not generate id
            return next();
        }

        // Find the last document to get the highest id
        FAQ.findOne({}, {}, { sort: { 'id': -1 } }, function(err, lastDoc) {
            if (err) {
                return next(err);
            }
            // Calculate new id
            doc.id = (lastDoc && lastDoc.id || 0) + 1;
            next();
        });
    });

    const FAQ = mongoose.model("faqs", schema);
    return FAQ;
};