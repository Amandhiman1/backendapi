const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            title: String,
            data: Object,
            createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
        },
        { timestamps: false }
    );

    schema.method("toJSON", function () {
        const { _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const cmsPages = mongoose.model("cmsPages", schema);
    return cmsPages;
}