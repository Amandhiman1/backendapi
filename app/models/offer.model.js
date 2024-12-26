const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            from: { type: String, required: true },
            to: { type: String, required: true },
            price: { type: Number, required: true },
            airline: { type: String, required: true },
            travelDate: { type: Date, required: true },
            salesValid: { type: Date, required: true },
            bagAllot: { type: String, required: true },
            policy: { type: Object, required: true },
            cabin: { type: String, required: true },
            image: { type: String, required: true },
            createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
            updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
            cancelFees: { type: String, required: true },
            changeFees: { type: String, required: true },
            desc: { type: Object, required: true },
        },  
        { timestamps: true }
    );

    const Offer = mongoose.model("Offer", schema);
    return Offer;
};
